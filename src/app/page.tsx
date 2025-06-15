import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.startContainer}>
        <h1 className={styles.title}>Mondrian.fun</h1>
        <p className={styles.subtitle}>
          Create your own Mondrian-style artwork
        </p>
        <div className={styles.buttonContainer}>
          <Link href="/studio" className={styles.startButton}>
            Start Creating
          </Link>
          <Link href="/gallery" className={styles.galleryButton}>
            View Gallery
          </Link>
        </div>
        <p className={styles.note}>
          This is the new version using Next.js with server-side S3 handling for
          improved security.
        </p>
      </div>
    </main>
  );
}
