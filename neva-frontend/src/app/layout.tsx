import React from 'react';
import './globals.css';
import Navbar from '../components/common/Navbar';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Neva E-Commerce',
  description: 'Clean and modern shopping experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className={`${plusJakartaSans.className} flex min-h-full flex-col bg-zinc-950 text-zinc-50 relative`}>
        {/* Global Grid Pattern Background */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:18px_30px]" />
        <Navbar />
        <div className="flex-1 relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}