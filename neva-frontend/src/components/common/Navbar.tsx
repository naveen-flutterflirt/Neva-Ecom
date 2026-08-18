'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useAppSelector } from '../../store';
import { useTheme } from '../providers/ThemeProvider';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const navLinks = [
    { label: 'PLA Products', href: '/shop' },
    { label: 'IoT Products', href: '/categories' },
    { label: 'Custom Products', href: '/new-arrivals' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${isScrolled
      ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-lg'
      : 'bg-transparent border-b border-transparent'
      }`}>
      {/* Added top margin spacer to prevent content shift when sticky */}
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex flex-1 justify-start items-center">
          <Link href="/" className="text-xl font-black tracking-widest text-zinc-900 dark:text-white hover:opacity-90">
            NIVASHOP<span className="text-violet-400">.</span>IN
          </Link>
        </div>

        <div className="hidden md:flex justify-center items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-1 justify-end items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>

          <Link href="/cart" className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="Shopping Cart">
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.6)]">
                {totalCount}
              </span>
            )}
          </Link>

          <Link href="/login" className="hidden md:block p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" aria-label="Profile">
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white md:hidden transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 shadow-inner transition-all duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1.5 border-b border-zinc-100 dark:border-zinc-900/50"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1.5 border-b border-zinc-100 dark:border-zinc-900/50"
          >
            Profile
          </Link>
        </div>
      )}
    </nav>
  );
}

