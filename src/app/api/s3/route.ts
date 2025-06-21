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

// Helper to fetch painting metadata from S3
async function fetchPaintingMeta(s3Object: S3Object) {
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
        Key: s3Object.Key,
        ETag: s3Object.ETag,
        artist: parsed.details?.artist || "",
        title: parsed.details?.title || "",
        year: parsed.details?.year || "",
        lastModified: parsed.details?.date || 0,
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
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);

      // Convert stream to text if it's JSON
      if (response.Body) {
        const bodyContents = await response.Body.transformToString();
        return NextResponse.json(JSON.parse(bodyContents));
      }

      return NextResponse.json(
        { error: "No body in response" },
        { status: 404 }
      );
    }
    // If search is present, fetch all, filter, and paginate
    else if (search) {
      const allObjects = await fetchAllObjects();
      // Sort by LastModified descending
      allObjects.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      // Fetch metadata for all objects
      const metas = await Promise.all(
        allObjects.map((obj) => (obj.Key ? fetchPaintingMeta(obj) : null))
      );
      // Filter by search (all words must be present in artist or title)
      const searchWords = search.split(/\s+/).filter(Boolean);
      const filtered = metas.filter((meta) => {
        if (!meta) return false;
        const combined = (meta.artist + " " + meta.title).toLowerCase();
        return searchWords.every((word) => combined.includes(word));
      });
      // Paginate
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const files = filtered.slice(start, end);
      const hasMore = end < filtered.length;
      return NextResponse.json({
        files,
        hasMore,
        total: filtered.length,
        page,
        pageSize,
      });
    }
    // Otherwise, fetch all objects, sort, and paginate
    else {
      const allObjects = await fetchAllObjects();
      // Sort by LastModified descending
      allObjects.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
        const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      // Paginate
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const files = allObjects.slice(start, end);
      const hasMore = end < allObjects.length;
      return NextResponse.json({
        files,
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

    const key = `${data.details.artist}${data.details.date}.json`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      ACL: "public-read",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error("S3 error:", error);
    return NextResponse.json(
      { error: "Failed to save to S3" },
      { status: 500 }
    );
  }
}
