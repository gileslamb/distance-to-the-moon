import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Distance to the Moon",
  description: "Experience the award-winning stop-motion film and original soundtrack. An immersive journey inspired by Italo Calvino.",
  openGraph: {
    title: "Distance to the Moon",
    description: "Experience the award-winning stop-motion film and original soundtrack. An immersive journey inspired by Italo Calvino.",
    url: "https://www.distancetothemoonfilm.com",
    siteName: "Distance to the Moon",
    type: "website",
    images: [
      {
        url: "https://www.distancetothemoonfilm.com/dttm-poster-12.jpg",
        alt: "Distance to the Moon film poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Distance to the Moon",
    description: "Experience the award-winning stop-motion film and original soundtrack. An immersive journey inspired by Italo Calvino.",
    images: ["https://www.distancetothemoonfilm.com/dttm-poster-12.jpg"],
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
        {children}
      </body>
    </html>
  );
}
