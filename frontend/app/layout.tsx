import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Báo cáo - thống kê | Nội trú HIS",
  description: "Giao diện báo cáo thống kê nội trú bằng Next.js, Tailwind CSS, shadcn/ui và ECharts"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="font-sans">{children}</body>
    </html>
  );
}
