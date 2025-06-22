import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  _Object as S3Object,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

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

// GET handler for listing objects or getting a specific object
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search")?.toLowerCase() || "";

  try {
    // If key is provided, get a specific object
    if (key) {
      // First get all objects to determine the painting number
      const allObjects = await fetchAllObjects();
      allObjects.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateA.getTime() - dateB.getTime(); // Oldest first for numbering
      });

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
      // Sort by LastModified ascending (oldest first) for numbering
      allObjects.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

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

      // Sort filtered results by date descending (newest first) for display
      const sortedIndices = [...filteredIndices].sort((a, b) => {
        const dateA = allObjects[a].LastModified
          ? new Date(allObjects[a].LastModified!)
          : new Date(0);
        const dateB = allObjects[b].LastModified
          ? new Date(allObjects[b].LastModified!)
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

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
      // Sort by LastModified ascending (oldest first) for numbering
      allObjects.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

      // Sort for display (newest first)
      const displayObjects = [...allObjects].sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

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
