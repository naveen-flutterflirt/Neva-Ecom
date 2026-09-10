import React from 'react';
import './globals.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ReduxProvider from '../components/providers/ReduxProvider';
import { ThemeProvider } from '../components/providers/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://nivashop.in'),
  title: {
    default: 'NIVASHOP - Premium 3D Printed Accessories & IoT Hardware',
    template: '%s | NIVASHOP'
  },
  description: 'Shop premium 3D printed desk accessories, custom filaments, and developer-ready smart IoT hardware for creators at NIVASHOP.',
  keywords: ['3D printed accessories', 'IoT hardware', 'custom filaments', 'desk accessories', 'NIVASHOP', '3D printing India', 'smart home devices', 'developer hardware'],
  authors: [{ name: 'NIVASHOP' }],
  creator: 'NIVASHOP',
  publisher: 'NIVASHOP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logobgg.png',
    shortcut: '/logobgg.png',
    apple: '/logobgg.png',
  },
  openGraph: {
    title: 'NIVASHOP - Premium 3D Printed Accessories & IoT Hardware',
    description: 'Shop premium 3D printed desk accessories, custom filaments, and developer-ready smart IoT hardware for creators at NIVASHOP.',
    url: 'https://nivashop.in',
    siteName: 'NIVASHOP',
    images: [
      {
        url: '/logobgg.png',
        width: 800,
        height: 800,
        alt: 'NIVASHOP Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIVASHOP - Premium 3D Printed Accessories & IoT Hardware',
    description: 'Shop premium 3D printed desk accessories, custom filaments, and developer-ready smart IoT hardware for creators at NIVASHOP.',
    images: ['/logobgg.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.className} flex min-h-full flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 relative transition-colors duration-300`}>
        {/* Global Grid Pattern Background */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:18px_30px]" />
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <div className="flex-1 relative z-10">
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}