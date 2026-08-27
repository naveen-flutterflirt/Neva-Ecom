'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';

const WhatsAppIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  if (pathname && (pathname.startsWith('/admin') || pathname === '/admin-login')) {
    return null;
  }

  return (
    <footer className="w-full bg-white text-zinc-600 border-t border-zinc-200/80 dark:bg-[#0c0c0e] dark:text-zinc-400 dark:border-zinc-900/90 py-8 md:py-12 px-4 sm:px-6 md:px-12 transition-colors duration-200">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-start justify-between">

          {/* Brand Info & Social Links (5 Cols on Desktop, Full on Mobile) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <Link
                href="/"
                className="text-xl font-black tracking-[0.14em] text-zinc-950 transition-all duration-200 hover:opacity-75 dark:text-white sm:text-2xl"
              >
                NIVA<span className="text-zinc-500 dark:text-zinc-400">SHOP</span>
              </Link>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed hidden sm:block">
              Premium 3D printed desk accessories, custom filaments & dev-ready smart hardware for creators.
            </p>

            {/* Social Icons */}
            <div className="pt-1 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-100/80 text-zinc-600 hover:border-blue-500/50 hover:text-blue-600 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-blue-500/50 dark:hover:text-blue-400 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/nivashop.in?igsi=czBjeGRhMnRjdDhk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-100/80 text-zinc-600 hover:border-pink-500/50 hover:text-pink-600 hover:bg-pink-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-pink-500/50 dark:hover:text-pink-400 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/share/1987iqHkcC/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-100/80 text-zinc-600 hover:border-blue-600/50 hover:text-blue-700 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-blue-600/50 dark:hover:text-blue-500 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (3 Columns on Mobile, Tablet & Desktop) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 pt-1">

            {/* Column 1: Company */}
            <div className="space-y-3">
              <h4 className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                COMPANY
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-xs md:text-sm font-semibold text-zinc-700 hover:text-violet-600 dark:text-zinc-200 dark:hover:text-white transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Products */}
            <div className="space-y-3">
              <h4 className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                PRODUCTS
              </h4>
              <ul className="space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/custom-product" className="font-semibold text-zinc-700 hover:text-violet-600 dark:text-zinc-200 dark:hover:text-white transition-colors block truncate">
                    Custom Print
                  </Link>
                </li>
                <li>
                  <Link href="/3d-product" className="font-semibold text-zinc-700 hover:text-violet-600 dark:text-zinc-200 dark:hover:text-white transition-colors block">
                    3D Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/iot-product" className="font-semibold text-zinc-700 hover:text-violet-600 dark:text-zinc-200 dark:hover:text-white transition-colors block">
                    IoT Hardware
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-3">
              <h4 className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                CONTACT
              </h4>
              <ul className="space-y-2 text-xs md:text-sm">
                <li>
                  <a href="mailto:nivashop.in@gmail.com" className="flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-violet-600 dark:text-zinc-200 dark:hover:text-white transition-colors truncate" title="nivashop.in@gmail.com">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">Email Us</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/919131450933" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400 transition-colors whitespace-nowrap">
                    <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>9131450933</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-semibold">
          <p className="text-zinc-450 dark:text-zinc-500 uppercase tracking-[0.16em] text-[10px] md:text-[11px]">
            © {new Date().getFullYear()} NIVASHOP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-5 sm:gap-8 text-zinc-600 dark:text-zinc-400 text-[11px] md:text-xs">
            <Link href="/terms" className="hover:text-violet-600 dark:hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
