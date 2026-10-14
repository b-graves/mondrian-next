import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  _Object as S3Object,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { createdTime } from "../../../services/paintingDate";

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || "mondrian-riley-test";

// Helper to fetch all objects from S3 (paginated)
async function fetchAllObjects(): Promise<S3Object[]> {
  let allObjects: S3Object[] = [];
  let continuationToken: string | undefined = undefined;
  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    });
    const response: ListObjectsV2CommandOutput = await s3Client.send(command);
    if (response.Contents) {
      allObjects = allObjects.concat(response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

// Helper to fetch full painting data with number
async function fetchFullPaintingData(s3Object: S3Object, number: number) {
  if (!s3Object.Key) return null;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Object.Key,
  });
  const response = await s3Client.send(command);
  if (response.Body) {
    const bodyContents = await response.Body.transformToString();
    try {
      const parsed = JSON.parse(bodyContents);
      return {
        ...parsed,
        number,
        etag: s3Object.ETag?.replace(/"/g, ""), // S3 ETags are quoted
      };
    } catch {
      return null;
    }
  }
  return null;
}

type GalleryOrder = "newest" | "oldest" | "random";

function parseOrder(value: string | null): GalleryOrder {
  if (value === "oldest" || value === "random") return value;
  return "newest";
}


function randomRank(seed: number, key: string): number {
  let hash = seed >>> 0;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function orderObjects(
  objects: S3Object[],
  order: GalleryOrder,
  seed: number
): S3Object[] {
  const ordered = [...objects];
  if (order === "oldest") {
    ordered.sort((a, b) => createdTime(a) - createdTime(b));
  } else if (order === "random") {
    ordered.sort((a, b) => {
      const rank =
        randomRank(seed, a.Key || "") - randomRank(seed, b.Key || "");
      if (rank !== 0) return rank;
      return (a.Key || "").localeCompare(b.Key || "");
    });
  } else {
    ordered.sort((a, b) => createdTime(b) - createdTime(a));
  }
  return ordered;
}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const order = parseOrder(searchParams.get("order"));
  const seed = parseInt(searchParams.get("seed") || "0", 10) || 0;

  try {
    // If key is provided, get a specific object
    if (key) {
      // First get all objects to determine the painting number
      const allObjects = await fetchAllObjects();
      allObjects.sort((a, b) => createdTime(a) - createdTime(b));

      const paintingIndex = allObjects.findIndex((obj) => obj.Key === key);
      if (paintingIndex === -1) {
        return NextResponse.json(
          { error: "Painting not found" },
          { status: 404 }
        );
      }

      const paintingNumber = paintingIndex + 1; // 1-based numbering
      const painting = await fetchFullPaintingData(
        allObjects[paintingIndex],
        paintingNumber
      );

      if (!painting) {
        return NextResponse.json(
          { error: "Failed to parse painting" },
          { status: 500 }
        );
      }

      return NextResponse.json(painting);
    }
    // If search is present, fetch all, filter, and paginate
    else if (search) {
      const allObjects = await fetchAllObjects();
      allObjects.sort((a, b) => createdTime(a) - createdTime(b));

      // Filter by searching artist/title in the filename (S3 key)
      const searchWords = search.split(/\s+/).filter(Boolean);
      const filteredIndices = allObjects
        .map((obj, index) => {
          if (!obj.Key) return null;
          const keyLower = obj.Key.toLowerCase();
          const matches = searchWords.every((word) => keyLower.includes(word));
          return matches ? index : null;
        })
        .filter((index): index is number => index !== null);

      // Sort filtered results for display
      const sortedIndices = orderObjects(
        filteredIndices.map((index) => allObjects[index]),
        order,
        seed
      ).map((object) => allObjects.findIndex((item) => item.Key === object.Key));

      // Paginate
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageIndices = sortedIndices.slice(start, end);

      // Fetch full paintings with numbers
      const paintings = await Promise.all(
        pageIndices.map(async (index) => {
          const paintingNumber = index + 1; // 1-based numbering
          return await fetchFullPaintingData(allObjects[index], paintingNumber);
        })
      );

      const validPaintings = paintings.filter(
        (p): p is NonNullable<typeof p> => p !== null
      );
      const hasMore = end < sortedIndices.length;

      return NextResponse.json({
        paintings: validPaintings,
        hasMore,
        total: sortedIndices.length,
        page,
        pageSize,
      });
    }
    // Otherwise, fetch all objects, sort, and paginate
    else {
      const allObjects = await fetchAllObjects();
      allObjects.sort((a, b) => createdTime(a) - createdTime(b));

      // Sort for display
      const displayObjects = orderObjects(allObjects, order, seed);

      // Paginate
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageObjects = displayObjects.slice(start, end);

      // Fetch full paintings with numbers
      const paintings = await Promise.all(
        pageObjects.map(async (obj) => {
          const originalIndex = allObjects.findIndex((o) => o.Key === obj.Key);
          const paintingNumber = originalIndex + 1; // 1-based numbering
          return await fetchFullPaintingData(obj, paintingNumber);
        })
      );

      const validPaintings = paintings.filter(
        (p): p is NonNullable<typeof p> => p !== null
      );
      const hasMore = end < displayObjects.length;

      return NextResponse.json({
        paintings: validPaintings,
        hasMore,
        total: allObjects.length,
        page,
        pageSize,
      });
    }
  } catch (error) {
    console.error("S3 error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve from S3" },
      { status: 500 }
    );
  }
}

// POST handler for saving a new painting
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.painting || !data.details) {
      return NextResponse.json(
        { error: "Invalid painting data" },
        { status: 400 }
      );
    }

    // Get all existing objects to determine the next painting number
    const allObjects = await fetchAllObjects();
    const nextNumber = allObjects.length + 1; // 1-based numbering

    // Add the number to the painting data
    const paintingWithNumber = {
      ...data,
      number: nextNumber,
    };

    const safeArtist = (data.details.artist || "Anonymous")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const safeTitle = (data.details.title || "Untitled")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const key = `${safeArtist}-${safeTitle}-${data.details.date}.json`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(paintingWithNumber),
      ContentType: "application/json",
      ACL: "public-read",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, key, number: nextNumber });
  } catch (error) {
    console.error("S3 error:", error);
    return NextResponse.json(
      { error: "Failed to save to S3" },
      { status: 500 }
    );
  }
}
