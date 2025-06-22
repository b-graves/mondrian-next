import SavedPainting from "../types/SavedPainting";

/**
 * Get paintings from S3 with global date-sorted pagination and optional search
 */
export async function getPaintings({
  page = 1,
  pageSize = 10,
  search = "",
}: { page?: number; pageSize?: number; search?: string } = {}): Promise<{
  paintings: SavedPainting[];
  hasMore: boolean;
  total: number;
  page: number;
  pageSize: number;
}> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (search) params.append("search", search);

    // Use absolute URL for server-side calls, relative for client-side
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        : "";
    const url = `${baseUrl}/api/s3?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch paintings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching paintings:", error);
    throw error;
  }
}

/**
 * Get a specific painting by key
 */
export async function getPainting(key: string): Promise<SavedPainting> {
  try {
    // Use absolute URL for server-side calls, relative for client-side
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        : "";
    const url = `${baseUrl}/api/s3?key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch painting");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching painting:", error);
    throw error;
  }
}

/**
 * Save a painting to S3
 */
export async function savePainting(
  painting: SavedPainting
): Promise<{ success: boolean; key: string }> {
  try {
    const response = await fetch("/api/s3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(painting),
    });

    if (!response.ok) {
      throw new Error("Failed to save painting");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving painting:", error);
    throw error;
  }
}
