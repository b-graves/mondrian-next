import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About — Mondrian.fun",
  description:
    "A celebration of Piet Mondrian, where you can make a painting and hang it in the gallery.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <img
        className={styles.portrait}
        src="/about-portrait.jpg"
        alt="Piet Mondrian beside his easel"
      />
      <img
        className={styles.painting}
        src="/about-painting.jpg"
        alt="Composition with Large Red Plane, Yellow, Black, Gray and Blue, 1921, by Piet Mondrian"
      />
      <h1 className={styles.title}>mondrian.fun</h1>
      <p className={styles.description}>
        This site is a celebration of the artistic style of Piet Mondrian, a
        20th century Dutch artist best known for his abstract works using
        vertical and horizontal lines and the primary colors. Here you can
        create your own masterpiece in the style of Mondrian and hang it in a
        virtual gallery alongside other people&apos;s work. Head to the studio
        to get started or visit the gallery for some inspiration...
      </p>
      <p className={styles.credit}>
        Designed and built by{" "}
        <a href="https://bengrav.es" target="_blank" rel="noopener noreferrer">
          Ben Graves
        </a>
      </p>
      <Link href="/" className={styles.studioLink}>
        ← Go to studio
      </Link>
      <Link href="/gallery" className={styles.galleryLink}>
        Go to gallery →
      </Link>
    </main>
  );
}
