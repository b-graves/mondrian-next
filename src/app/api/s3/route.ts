import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
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
async function fetchAllObjects() {
  let allObjects = [];
  let continuationToken = undefined;
  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    });
    const response = await s3Client.send(command);
    if (response.Contents) {
      allObjects = allObjects.concat(response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

// GET handler for listing objects or getting a specific object
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

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
