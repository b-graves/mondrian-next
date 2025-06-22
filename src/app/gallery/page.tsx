import { Suspense } from "react";
import GalleryPageClient from "./GalleryPageClient";

export default function GalleryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPageClient />
    </Suspense>
  );
}
