'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { useTheme } from '../providers/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const cartItems = useAppSelector((state) => state.cart.items);
  const totalCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        isMobileMenuOpen &&
        !target.closest('[data-mobile-menu]') &&
        !target.closest('[data-mobile-menu-button]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Only these two products appear inside the Products dropdown
  const productCategories = [
    {
      label: 'PLA Products',
      href: '/shop',
    },
    {
      label: 'IoT Products',
      href: '/categories',
    },
  ];

  // These remain directly in the navbar
  const navLinks = [
    {
      label: 'Custom Products',
      href: '/custom-products/product-info',
    },
    {
      label: 'About',
      href: '/about',
    },
  ];

  // Check whether a navbar link is currently active
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Products is active when user is inside either product category
  const isProductsActive = productCategories.some(
    (item) => pathname === item.href
  );

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Link
            href="/"
            className="truncate text-[17px] font-black tracking-[0.12em] text-zinc-900 dark:text-white sm:text-xl sm:tracking-widest"
          >
            NIVASHOP<span className="text-violet-400">.</span>IN
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-6 md:flex">

          {/* Products Dropdown */}
          <div
            ref={productsRef}
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            {/* Products Trigger */}
            <div
              className={`flex cursor-default items-center gap-1 text-sm font-medium transition-colors ${
                isProductsActive
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
              aria-haspopup="menu"
            >
              Products

              <ChevronDown
                className={`ml-0.5 h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 ${
                  isProductsActive
                    ? 'text-white'
                    : 'text-zinc-500 dark:text-zinc-400'
                } ${
                  isProductsOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Invisible Hover Bridge */}
            <div className="absolute left-0 right-0 top-full h-3" />

            {/* Products Dropdown */}
            <div
              className={`absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 rounded-2xl border border-zinc-200/70 bg-white/95 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95 transition-all duration-200 ${
                isProductsOpen
                  ? 'pointer-events-auto translate-y-3 opacity-100'
                  : 'pointer-events-none translate-y-1 opacity-0'
              }`}
            >
              {productCategories.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-violet-50 text-violet-700 dark:bg-zinc-900 dark:text-violet-300'
                      : 'text-zinc-700 hover:bg-violet-50 hover:text-violet-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-violet-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Custom Products + About */}
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="shrink-0 p-1.5 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:p-2"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Search */}
          <button
            className="shrink-0 p-1.5 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:p-2"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative shrink-0 p-1.5 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:p-2"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5" />

            {totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.6)] sm:h-4 sm:w-4 sm:text-[9px]">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Login - Desktop Only */}
          <Link
            href="/login"
            className="hidden shrink-0 p-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white md:block"
            aria-label="Login"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            data-mobile-menu-button
            onClick={toggleMobileMenu}
            className="ml-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white sm:ml-1 sm:h-10 sm:w-10 md:hidden"
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          data-mobile-menu
          className="md:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 shadow-inner transition-all duration-200"
        >

          {/* Mobile Products */}
          <div className="space-y-2 border-b border-zinc-100 pb-2 dark:border-zinc-900/50">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Products
            </p>

            {productCategories.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 transition-colors ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Custom Products + About */}
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm font-medium py-1.5 border-b border-zinc-100 dark:border-zinc-900/50 transition-colors ${
                isActive(link.href)
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Profile */}
          <Link
            href="/login"
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