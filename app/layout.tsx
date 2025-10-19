import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "./context/SupabaseContext";

export const metadata: Metadata = {
  title: "Travel Wonder - Discover Your Next Adventure",
  description:
    "Explore amazing destinations around the world with Travel Wonder. Book your next adventure today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white font-sans">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
