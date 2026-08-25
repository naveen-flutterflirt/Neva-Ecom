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
import { useAppDispatch, useAppSelector } from '../../store';
import { clearCart, hydrateCart } from '../../store/cartSlice';
import { useTheme } from '../providers/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (cartItems && cartItems.length > 0) {
        localStorage.setItem('neva-saved-user-cart', JSON.stringify(cartItems));
      }
      localStorage.removeItem('neva-token');
      localStorage.removeItem('neva-user');
      localStorage.removeItem('neva-cart');
      localStorage.removeItem('neva-saved-addresses');
    }
    dispatch(clearCart());
    setIsLoggedIn(false);
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
      const hasToken = !!token;
      setIsLoggedIn(hasToken);
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('neva-auth-change', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('neva-auth-change', checkAuthStatus);
    };
  }, [pathname, dispatch]);

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
      label: '3D Products',
      href: '/3d-product',
    },
    {
      label: 'IoT Products',
      href: '/iot-product',
    },
  ];

  // These remain directly in the navbar
  const navLinks = [
    {
      label: 'Custom Products',
      href: '/custom-product',
    },
    {
      label: 'About',
      href: '/about',
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isProductsActive = productCategories.some((item) =>
    isActive(item.href)
  );

  if (pathname && (pathname.startsWith('/admin') || pathname === '/admin-login')) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-md'
        : 'bg-white/60 dark:bg-zinc-950/40 backdrop-blur-sm border-b border-zinc-200/30 dark:border-zinc-800/30'
        }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href="/"
            className="text-xl font-black tracking-[0.14em] text-zinc-950 transition-all duration-200 hover:opacity-75 dark:text-white sm:text-2xl"
          >
            NIVA<span className="text-violet-600 dark:text-violet-400">SHOP</span>
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
              className={`flex cursor-pointer items-center gap-1 text-sm font-semibold transition-colors ${isProductsActive
                ? 'text-violet-600 dark:text-violet-400 font-extrabold'
                : 'text-zinc-700 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white'
                }`}
              aria-haspopup="menu"
            >
              Products

              <ChevronDown
                className={`ml-0.5 h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 ${isProductsActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-zinc-500 dark:text-zinc-400'
                  } ${isProductsOpen ? 'rotate-180' : ''
                  }`}
              />
            </div>

            {/* Invisible Hover Bridge */}
            <div className="absolute left-0 right-0 top-full h-3" />

            {/* Products Dropdown Menu */}
            <div
              className={`absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950 transition-all duration-200 ${isProductsOpen
                ? 'pointer-events-auto translate-y-3 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0'
                }`}
            >
              {productCategories.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${isActive(item.href)
                    ? 'bg-violet-50 text-violet-700 dark:bg-zinc-900 dark:text-violet-300 font-bold'
                    : 'text-zinc-800 hover:bg-violet-50 hover:text-violet-700 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-violet-300'
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
              className={`text-sm font-semibold transition-colors ${isActive(link.href)
                ? 'text-violet-600 dark:text-violet-400 font-extrabold'
                : 'text-zinc-700 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white'
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
            className="shrink-0 p-1.5 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white sm:p-2 cursor-pointer"
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
            className="shrink-0 p-1.5 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white sm:p-2 cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative shrink-0 p-1.5 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white sm:p-2"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5" />

            {totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.6)] sm:h-4 sm:w-4 sm:text-[9px]">
                {totalCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login - Desktop Only */}
          {isLoggedIn ? (
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setIsUserDropdownOpen(true)}
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <button
                type="button"
                className="shrink-0 p-2 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white cursor-pointer"
                aria-label="User Account"
              >
                <User className="h-5 w-5" />
              </button>

              {/* Invisible Hover Bridge */}
              <div className="absolute right-0 top-full h-3 w-24" />

              {/* User Dropdown */}
              <div
                className={`absolute right-0 top-full z-50 w-44 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950 transition-all duration-200 ${isUserDropdownOpen
                  ? 'pointer-events-auto translate-y-3 opacity-100'
                  : 'pointer-events-none translate-y-1 opacity-0'
                  }`}
              >
                <Link
                  href="/profile"
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-violet-50 hover:text-violet-700 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-violet-300 transition-colors"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left block rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden shrink-0 p-2 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white md:block"
              aria-label="Login"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            data-mobile-menu-button
            onClick={toggleMobileMenu}
            className="ml-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white sm:ml-1 sm:h-10 sm:w-10 md:hidden cursor-pointer"
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
              Products
            </p>

            {productCategories.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-semibold py-1.5 transition-colors ${isActive(link.href)
                  ? 'text-violet-600 dark:text-violet-400 font-extrabold'
                  : 'text-zinc-700 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white'
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
              className={`block text-sm font-semibold py-1.5 border-b border-zinc-100 dark:border-zinc-900/50 transition-colors ${isActive(link.href)
                ? 'text-violet-600 dark:text-violet-400 font-extrabold'
                : 'text-zinc-700 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white'
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Profile / Login */}
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-white py-1.5 border-b border-zinc-100 dark:border-zinc-900/50"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left block text-sm font-semibold text-red-600 hover:text-red-700 py-1.5 border-b border-zinc-100 dark:border-zinc-900/50 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-white py-1.5 border-b border-zinc-100 dark:border-zinc-900/50"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}