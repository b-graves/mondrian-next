import SavedPainting from '../types/SavedPainting';
import { S3Object } from '../types/S3Types';

/**
 * Get all paintings from S3
 */
export async function getPaintings(): Promise<{ files: S3Object[] }> {
  try {
    const response = await fetch('/api/s3');
    if (!response.ok) {
      throw new Error('Failed to fetch paintings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching paintings:', error);
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
      throw new Error('Failed to fetch painting');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching painting:', error);
    throw error;
  }
}

/**
 * Save a painting to S3
 */
export async function savePainting(painting: SavedPainting): Promise<{ success: boolean, key: string }> {
  try {
    const response = await fetch('/api/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(painting),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save painting');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving painting:', error);
    throw error;
  }
} 