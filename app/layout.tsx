import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "./context/SupabaseContext";

export const metadata: Metadata = {
  title: "HÀNH TRÌNH VIỆT - Khám phá chuyến đi mơ ước",
  description:
    "Khám phá những hành trình đặc sắc cùng HÀNH TRÌNH VIỆT và đặt tour trọn gói cho kỳ nghỉ đáng nhớ của bạn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white font-sans" suppressHydrationWarning>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
