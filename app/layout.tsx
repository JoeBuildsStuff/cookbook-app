import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatPanel } from "@/components/chat/chat-panel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Cookbook",
  description: "A recipe management web app built by Joe",
  openGraph: {
    title: "Cookbook",
    description: "A recipe management web app built by Joe",
    url: "/",
    siteName: "Cookbook",
    type: "website",
    images: ["/recipe-screenshot.png"],
  },
  twitter: {
    title: "Cookbook",
    description: "A recipe management web app built by Joe",
    card: "summary_large_image",
    images: ["/recipe-screenshot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <ChatBubble />
          <ChatPanel />
        </Providers>
      </body>
    </html>
  );
}
