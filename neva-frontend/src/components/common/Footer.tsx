import Link from 'next/link';

const footerLinks = [
  { label: 'Home', href: '/#top' },
  { label: 'PLA Products', href: '/shop' },
  { label: 'IoT Products', href: '/categories' },
  { label: 'Custom Products', href: '/new-arrivals' },
  { label: 'About', href: '/about' },
];

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-zinc-200/50 bg-white/80 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 py-6 text-zinc-300 sm:py-7">
      <div className="mx-auto w-full max-w-[100%] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-zinc-200/70 pb-5 dark:border-zinc-800/80 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/#top" className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 text-sm font-bold text-violet-300 transition hover:opacity-90">
              N
            </Link>
            <div>
              <Link href="/#top" className="block text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                NIVASHOP.IN
              </Link>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Smart materials • smart living</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-violet-500 dark:hover:text-violet-300">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:+911234567890" className="transition hover:text-violet-500 dark:hover:text-violet-300">+91 12345 67890</a>
            <a href="mailto:hello@nevashop.in" className="transition hover:text-violet-500 dark:hover:text-violet-300">hello@nevashop.in</a>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shipping" className="transition hover:text-violet-500 dark:hover:text-violet-300">Shipping</Link>
            <Link href="/returns" className="transition hover:text-violet-500 dark:hover:text-violet-300">Returns</Link>
            <Link href="/privacy" className="transition hover:text-violet-500 dark:hover:text-violet-300">Privacy</Link>
            <Link href="/terms" className="transition hover:text-violet-500 dark:hover:text-violet-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
