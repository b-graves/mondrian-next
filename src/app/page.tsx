'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Studio from '../components/Studio/Studio';
import Gallery from '../components/Gallery/Gallery';
// import Start from '../components/Start/Start';
import SavedPainting from '../types/SavedPainting';
import { getPaintings, getPainting } from '../services/s3Service';

// Define S3Object type directly in this file to avoid import issues
interface S3Object {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
  Owner?: {
    DisplayName?: string;
    ID?: string;
  };
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState(1);
  const [gallery, setGallery] = useState<{ paintings: SavedPainting[] }[]>([]);
  const [userPaintings, setUserPaintings] = useState<SavedPainting[]>([]);

  const handleTabChange = async (tab: number, refresh: boolean) => {
    if (refresh) {
      await fetchPaintings();
    }
    setCurrentTab(tab);
  };

  const addUserPainting = (userPainting: SavedPainting) => {
    setUserPaintings(prev => [userPainting, ...prev]);
  };


  const populateGallery = useCallback(async (files: S3Object[]) => {
    if (!files || files.length === 0) return;
    
    // Sort by last modified date
    const sortedFiles = [...files].sort((a, b) => {
      if (a.LastModified && b.LastModified) {
        const dateA = a.LastModified instanceof Date ? a.LastModified : new Date(a.LastModified);
        const dateB = b.LastModified instanceof Date ? b.LastModified : new Date(b.LastModified);
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
    
    // Get first 20 paintings at most
    const filesToFetch = sortedFiles.slice(0, 20);
    
    // Create a room for these paintings
    const room = { paintings: [] as SavedPainting[] };
    
    // Fetch each painting and add to the room
    for (const file of filesToFetch) {
      if (file.Key) {
        try {
          const painting = await getPainting(file.Key);
          room.paintings.push(painting);
        } catch (error) {
          console.error(`Error fetching painting ${file.Key}:`, error);
        }
      }
    }
    
    setGallery([room]);
  }, []);

  const fetchPaintings = useCallback(async () => {
    try {
      const data = await getPaintings();
      populateGallery(data.files);
    } catch (error) {
      console.error('Error fetching paintings:', error);
    }
  }, [populateGallery]);

  useEffect(() => {
    fetchPaintings();
  }, [fetchPaintings]);

  // For now, just render the Studio component
  // Later, we can add the Gallery and Start components
  return (
    <main className={styles.main}>
      {currentTab === 0 && (
        <Studio setTab={handleTabChange} setUserPainting={addUserPainting} />
      )}
      {currentTab === 1 && (
        <div className={styles.startContainer}>
          <h1 className={styles.title}>Mondrian.fun</h1>
          <p className={styles.subtitle}>Create your own Mondrian-style artwork</p>
          <div className={styles.buttonContainer}>
            <button 
              className={styles.startButton} 
              onClick={() => handleTabChange(0, false)}
            >
              Start Creating
            </button>
            <button 
              className={styles.galleryButton} 
              onClick={() => handleTabChange(2, true)}
            >
              View Gallery
            </button>
          </div>
          <p className={styles.note}>This is the new version using Next.js with server-side S3 handling for improved security.</p>
        </div>
      )}
      {currentTab === 2 && (
        <Gallery 
          setTab={handleTabChange} 
          rooms={gallery} 
          userPaintings={userPaintings} 
        />
      )}
    </main>
  );
}
