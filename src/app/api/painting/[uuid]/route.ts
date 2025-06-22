import { NextRequest, NextResponse } from "next/server";
import { getPaintings } from "../../../../services/s3Service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const paintingNumber = parseInt(uuid, 10);

    if (isNaN(paintingNumber)) {
      return NextResponse.json(
        { error: "Invalid painting number" },
        { status: 400 }
      );
    }

    console.log("Looking for painting number:", paintingNumber);

    // Get all paintings to find the one with the matching number
    const data = await getPaintings({ page: 1, pageSize: 1000 }); // Get all paintings
    console.log("Found", data.paintings.length, "total paintings");

    // Find the painting with the matching number
    const matchingPainting = data.paintings.find((painting) => {
      console.log(
        "Checking painting number:",
        painting.number,
        "against:",
        paintingNumber
      );
      return painting.number === paintingNumber;
    });

    console.log("Matching painting found:", matchingPainting);

    if (!matchingPainting) {
      console.log("No matching painting found for number:", paintingNumber);
      return NextResponse.json(
        { error: "Painting not found" },
        { status: 404 }
      );
    }

    console.log("Successfully found painting number:", paintingNumber);

    return NextResponse.json(matchingPainting);
  } catch (error) {
    console.error("Error fetching painting:", error);
    return NextResponse.json(
      { error: "Failed to fetch painting" },
      { status: 404 }
    );
  }
}
