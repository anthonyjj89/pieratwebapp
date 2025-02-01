import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PieRat - Star Citizen Piracy Management",
  description: "Manage your Star Citizen piracy operations with PieRat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
