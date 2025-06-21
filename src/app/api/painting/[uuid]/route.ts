import { NextRequest, NextResponse } from "next/server";
import { getPainting } from "../../../../services/s3Service";
import { getPaintings } from "../../../../services/s3Service";

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;

    // Since S3 doesn't support direct lookup by ETag, we need to list all objects
    // and find the one with the matching ETag
    const data = await getPaintings({ page: 1, pageSize: 1000 }); // Get all paintings

    // Find the painting with the matching ETag
    const matchingFile = data.files.find((file) => {
      const etag = file.ETag ? file.ETag.replace(/"/g, "") : "";
      return etag === uuid;
    });

    if (!matchingFile || !matchingFile.Key) {
      return NextResponse.json(
        { error: "Painting not found" },
        { status: 404 }
      );
    }

    // Fetch the painting using the found key
    const painting = await getPainting(matchingFile.Key);

    return NextResponse.json(painting);
  } catch (error) {
    console.error("Error fetching painting:", error);
    return NextResponse.json(
      { error: "Failed to fetch painting" },
      { status: 404 }
    );
  }
}
