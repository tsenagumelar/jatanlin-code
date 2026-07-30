import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jatanlin Data Center",
  description: "Dasbor data center Jatanlin terpusat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
