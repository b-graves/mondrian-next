import { NextRequest, NextResponse } from "next/server";
import { getPainting } from "../../../../services/s3Service";
import { getPaintings } from "../../../../services/s3Service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    console.log("Looking for painting with ETag/UUID:", uuid);

    // Since S3 doesn't support direct lookup by ETag, we need to list all objects
    // and find the one with the matching ETag
    const data = await getPaintings({ page: 1, pageSize: 1000 }); // Get all paintings
    console.log("Found", data.files.length, "total files");

    // Find the painting with the matching ETag
    const matchingFile = data.files.find((file) => {
      const etag = file.ETag ? file.ETag.replace(/"/g, "") : "";
      console.log("Checking file:", file.Key, "ETag:", etag, "against:", uuid);
      return etag === uuid;
    });

    console.log("Matching file found:", matchingFile);

    if (!matchingFile || !matchingFile.Key) {
      console.log("No matching file found for ETag:", uuid);
      return NextResponse.json(
        { error: "Painting not found" },
        { status: 404 }
      );
    }

    // Fetch the painting using the found key
    const painting = await getPainting(matchingFile.Key);
    console.log("Successfully fetched painting for key:", matchingFile.Key);

    return NextResponse.json(painting);
  } catch (error) {
    console.error("Error fetching painting:", error);
    return NextResponse.json(
      { error: "Failed to fetch painting" },
      { status: 404 }
    );
  }
}
