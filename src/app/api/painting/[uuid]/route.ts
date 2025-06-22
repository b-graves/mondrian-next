import { NextRequest, NextResponse } from "next/server";
import { fetchAllObjects, fetchFullPaintingData } from "./helpers";
import { _Object as S3Object } from "@aws-sdk/client-s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid: etag } = await params;

    const allObjects = await fetchAllObjects();

    const matchingObject = allObjects.find(
      (obj: S3Object) => obj.ETag?.replace(/"/g, "") === etag
    );

    if (!matchingObject) {
      return NextResponse.json(
        { error: "Painting not found" },
        { status: 404 }
      );
    }

    const sortedObjects = [...allObjects].sort((a: S3Object, b: S3Object) => {
      const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
      const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

    const paintingIndex = sortedObjects.findIndex(
      (obj: S3Object) => obj.Key === matchingObject.Key
    );

    const paintingNumber = paintingIndex + 1;

    const painting = await fetchFullPaintingData(
      matchingObject,
      paintingNumber
    );

    if (!painting) {
      return NextResponse.json(
        { error: "Failed to parse painting" },
        { status: 500 }
      );
    }

    return NextResponse.json(painting);
  } catch (error) {
    console.error("Error fetching painting:", error);
    return NextResponse.json(
      { error: "Failed to fetch painting" },
      { status: 500 }
    );
  }
}
