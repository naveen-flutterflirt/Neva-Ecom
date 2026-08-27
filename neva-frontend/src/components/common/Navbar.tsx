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

import { apiClient } from '../../lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Search Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { theme, toggleTheme } = useTheme();

  const cartItems = useAppSelector((state) => state.cart.items);
  const totalCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const productsRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch products for fast live search
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      if (allProducts.length === 0) {
        setIsSearching(true);
        apiClient('/products')
          .then(res => {
            if (res && Array.isArray(res.data)) {
              setAllProducts(res.data);
            }
          })
          .catch(err => console.error('Failed to load products for search:', err))
          .finally(() => setIsSearching(false));
      }
    }
  }, [isSearchOpen]);

  // Filter products live as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter((p: any) => {
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const catName = typeof p.category === 'object' && p.category !== null ? (p.category.name || '') : (p.category || '');
      const catMatch = catName.toLowerCase().includes(q);
      const skuMatch = (p.sku || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      return nameMatch || catMatch || skuMatch || descMatch;
    });
    setSearchResults(filtered.slice(0, 8)); // Top 8 matches
  }, [searchQuery, allProducts]);

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
    <>
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

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="shrink-0 p-1.5 text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white sm:p-2 cursor-pointer"
              aria-label="Search"
              title="Search products (Ctrl+K)"
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

    {/* Professional Live Search Modal Overlay */}
    {isSearchOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md transition-opacity duration-200"
        onClick={() => setIsSearchOpen(false)}
      >
        <div
          className="w-full max-w-2xl bg-white dark:bg-[#0c0d14] rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all transform duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Box Header */}
          <div className="relative flex items-center border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/40">
            <Search className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3D models, IoT sensors, hardware..."
              className="w-full bg-transparent px-3 text-sm sm:text-base font-semibold outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition mr-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                ESC
              </kbd>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="ml-2 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results & Suggestions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isSearching ? (
              <div className="py-12 text-center text-xs font-semibold text-zinc-400 flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                Searching catalog...
              </div>
            ) : searchQuery.trim() !== '' ? (
              searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2">
                    Matching Products ({searchResults.length})
                  </p>
                  {searchResults.map((item) => {
                    const primaryImg = item.images && item.images.length > 0 ? item.images[0].imageUrl : (item.image || '');
                    const catName = typeof item.category === 'object' && item.category !== null ? item.category.name : (item.category || 'Product');
                    const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    const numDiscount = item.discountPrice ? (typeof item.discountPrice === 'string' ? parseFloat(item.discountPrice) : item.discountPrice) : null;

                    return (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3.5 p-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-violet-50/80 dark:hover:bg-violet-950/40 hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-200 group"
                      >
                        <div className="h-12 w-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 overflow-hidden shrink-0">
                          <img src={primaryImg} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            {catName}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-extrabold font-mono text-zinc-900 dark:text-white block">
                            ₹{(numDiscount || numPrice).toLocaleString()}
                          </span>
                          {numDiscount && (
                            <span className="text-[10px] font-mono text-zinc-400 line-through">
                              ₹{numPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No matching products found</p>
                  <p className="text-xs text-zinc-400">Try searching for &quot;Dragon&quot;, &quot;ESP32&quot;, &quot;Lamp&quot;, or &quot;Sensor&quot;</p>
                </div>
              )
            ) : (
              /* Quick Categories / Suggestions */
              <div className="space-y-3 p-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Quick Categories
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Link
                    href="/3d-product"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                  >
                    <span>3D Printed Models</span>
                    <span className="text-violet-600 dark:text-violet-400">→</span>
                  </Link>
                  <Link
                    href="/iot-product"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                  >
                    <span>IoT Sensors &amp; Boards</span>
                    <span className="text-violet-600 dark:text-violet-400">→</span>
                  </Link>
                  <Link
                    href="/custom-product"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                  >
                    <span>Custom Printing</span>
                    <span className="text-violet-600 dark:text-violet-400">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}