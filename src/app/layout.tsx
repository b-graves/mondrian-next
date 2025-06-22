import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { PaintingsProvider } from "../contexts/PaintingsContext";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Mondrian.fun - Create your own Mondrian-style art",
  description: "A digital playground to create Mondrian-style artworks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
      </head>
      <body className={spaceMono.className}>
        <PaintingsProvider>{children}</PaintingsProvider>
      </body>
    </html>
  );
}
