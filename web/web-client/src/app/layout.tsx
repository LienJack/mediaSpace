import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import React from 'react';
import { Toaster } from 'react-hot-toast';

// const inter = Inter({
//   subsets: ["latin"],
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: "素材管理库",
  description: "素材管理库",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
        </Providers>
      </body>
    </html>
  );
}
