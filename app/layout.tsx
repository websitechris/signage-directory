import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "A to Z of Signs - Find UK Sign Shops & Signage Services",
  description: "Discover sign shops and signage services across UK cities",
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
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link 
                  href="/" 
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                >
                  A to Z of Signs
                </Link>
                <Link 
                  href="/" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  Browse Cities
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
