import SavedPainting from "../types/SavedPainting";
import { S3Object } from "../types/S3Types";

/**
 * Get paintings from S3 with global date-sorted pagination
 */
export async function getPaintings({
  page = 1,
  pageSize = 10,
}: { page?: number; pageSize?: number } = {}): Promise<{
  files: S3Object[];
  hasMore: boolean;
  total: number;
  page: number;
  pageSize: number;
}> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    const url = `/api/s3?${params.toString()}`;
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
    const response = await fetch(`/api/s3?key=${encodeURIComponent(key)}`);
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
