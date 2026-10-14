import { NextRequest, NextResponse } from "next/server";
import { fetchAllObjects, fetchFullPaintingData } from "./helpers";
import { _Object as S3Object } from "@aws-sdk/client-s3";
import { createdTime } from "../../../../services/paintingDate";

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

    const sortedObjects = [...allObjects].sort(
      (a: S3Object, b: S3Object) => createdTime(a) - createdTime(b)
    );

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
