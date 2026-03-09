import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; 
import Providers from "../components/Providers";
import Navbar from "../components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "台大學生會官網",
  description: "國立台灣大學學生會官方網站發文系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        {/* 用 Providers 包住整個網站，這樣所有頁面都能讀取到登入狀態 */}
        <Providers>
          {/* 將導覽列放在最上方 */}
          <Navbar />
          
          {/* 網站的主要內容區域 */}
          <main className="min-h-screen bg-gray-50 pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}