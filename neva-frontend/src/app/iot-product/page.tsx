'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Cpu,
  ArrowLeft,
  Filter,
  X,
  Check,
  RotateCcw,
  Star,
  Sliders,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckSquare,
  Square,
  Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductCard from '../../components/product/ProductCard';
import QuickViewModal from '../../components/product/QuickViewModal';
import Toast from '../../components/ui/Toast';
import { Product } from '../../types/product';
import { apiClient } from '../../lib/api';

import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';

const safeParseJSON = (val: any, fallback: any = []) => {
  if (!val) return fallback;
  if (Array.isArray(val) || typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed !== null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

const defaultColorSwatches = [
  { name: 'Violet', value: '#a855f7' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Black', value: '#18181b' },
  { name: 'White', value: '#ffffff' },
  { name: 'Amber', value: '#f59e0b' },
];

export default function IotProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state (Category removed, Color Circles added)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [priceLimit, setPriceLimit] = useState<number>(10000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);

  // Accordion Section States
  const [openSections, setOpenSections] = useState({
    price: true,
    colors: true,
    materials: true,
    rating: true,
    status: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch IoT Products from backend API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/products');
      if (res && Array.isArray(res.data)) {
        const iotList: Product[] = res.data
          .filter((p: any) => {
            const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category || '');
            const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
            return p.isIoT || catName.toLowerCase().includes('iot') || catSlug.toLowerCase().includes('iot') || catName.toLowerCase().includes('smart');
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            category: typeof p.category === 'object' && p.category !== null ? (p.category.name || 'IoT Product') : (p.category || 'IoT Product'),
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            discountPrice: p.discountPrice ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : p.discountPrice) : null,
            stock: p.stock || 0,
            status: p.status || 'active',
            rating: p.rating || 4.9,
            image: p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            images: p.images || [],
            isIoT: true,
            description: p.description || '',
            materialVariants: safeParseJSON(p.materialVariants, []),
            colorOptions: safeParseJSON(p.colorOptions, []),
            sizeVariants: safeParseJSON(p.sizeVariants, []),
            careInstructions: safeParseJSON(p.careInstructions, []),
            keyFeatures: safeParseJSON(p.keyFeatures, []),
            specifications: safeParseJSON(p.specifications, {}),
            specs: safeParseJSON(p.specifications, {}),
          }));

        setProducts(iotList);

        // Find max price for horizontal range slider
        let maxP = 5000;
        iotList.forEach((p) => {
          if (Number(p.price) > maxP) maxP = Number(p.price);
        });
        setMaxPrice(Math.ceil(maxP));
        setPriceLimit(Math.ceil(maxP));
      }
    } catch (err) {
      console.error('Failed to load IoT products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    try {
      const alreadyInCart = cartItems.some((item) => item.product.id === product.id);
      if (alreadyInCart) {
        showToast(`⚠️ "${product.name}" is already in your cart!`);
        return;
      }
      dispatch(addToCart({ product, quantity: 1 }));
      showToast(`✓ Added "${product.name}" to cart!`);
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  const handleBuyNow = (product: Product) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to proceed with Buy Now!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    const alreadyInCart = cartItems.some((item) => String(item.product.id) === String(product.id));
    if (!alreadyInCart) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
    router.push('/checkout');
  };

  // Dynamically extract color options from products schema + standard swatches
  const availableColorSwatches = useMemo(() => {
    const map = new Map<string, string>();
    defaultColorSwatches.forEach((c) => map.set(c.name.toLowerCase(), c.value));

    products.forEach((p) => {
      if (Array.isArray(p.colorOptions)) {
        p.colorOptions.forEach((c: any) => {
          if (typeof c === 'object' && c !== null && c.name && c.value) {
            map.set(c.name.toLowerCase(), c.value);
          } else if (typeof c === 'string') {
            map.set(c.toLowerCase(), c);
          }
        });
      }
    });

    const result: { name: string; value: string }[] = [];
    map.forEach((value, nameKey) => {
      const formattedName = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
      result.push({ name: formattedName, value });
    });
    return result;
  }, [products]);

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  // Dynamically extract material variants / specs
  const materialsList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (Array.isArray(p.materialVariants)) {
        p.materialVariants.forEach((m: any) => {
          const matName = typeof m === 'string' ? m : m?.name || '';
          if (matName) set.add(matName);
        });
      }
    });
    return Array.from(set);
  }, [products]);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  // Filter & Sort Products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        const q = searchQuery.toLowerCase().trim();
        if (q && !(p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))) {
          return false;
        }

        // Horizontal price slider filter
        if (Number(p.price) > priceLimit) {
          return false;
        }

        // Color circles filter
        if (selectedColors.length > 0) {
          const hasColorMatch = selectedColors.some((sc) => {
            const scLower = sc.toLowerCase();

            // 1. Check in colorOptions array if present
            if (Array.isArray(p.colorOptions) && p.colorOptions.length > 0) {
              const matchedInOpts = p.colorOptions.some((c: any) => {
                if (!c) return false;
                const nameStr = typeof c === 'object' ? String(c.name || '').toLowerCase() : String(c).toLowerCase();
                const valStr = typeof c === 'object' ? String(c.value || '').toLowerCase() : '';
                return nameStr.includes(scLower) || scLower.includes(nameStr) || valStr.includes(scLower);
              });
              if (matchedInOpts) return true;
            }

            // 2. Fallback search in product name, description, and specifications
            const pName = (p.name || '').toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            const pSpecs = JSON.stringify(p.specifications || {}).toLowerCase();

            return pName.includes(scLower) || pDesc.includes(scLower) || pSpecs.includes(scLower);
          });

          if (!hasColorMatch) {
            return false;
          }
        }

        // Material filter
        if (selectedMaterials.length > 0) {
          const pMats = Array.isArray(p.materialVariants)
            ? p.materialVariants.map((m: any) => (typeof m === 'string' ? m : m?.name || ''))
            : [];
          const hasMatMatch = selectedMaterials.some((sm) => pMats.includes(sm));
          if (!hasMatMatch) return false;
        }

        // Rating filter
        if (minRating > 0 && (p.rating || 0) < minRating) {
          return false;
        }

        // Stock filter
        if (inStockOnly && (p.stock ?? 0) <= 0) {
          return false;
        }

        // Discount / Sale filter
        if (onSaleOnly && (!p.discountPrice || p.discountPrice >= p.price)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, searchQuery, priceLimit, selectedColors, selectedMaterials, minRating, inStockOnly, onSaleOnly, sortBy]);

  const hasActiveFilters =
    searchQuery ||
    priceLimit < maxPrice ||
    selectedColors.length > 0 ||
    selectedMaterials.length > 0 ||
    minRating > 0 ||
    inStockOnly ||
    onSaleOnly;

  const resetAllFilters = () => {
    setSearchQuery('');
    setPriceLimit(maxPrice);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('featured');
  };

  // Filter Sidebar UI Component
  const FilterSidebarContent = () => (
    <div className="space-y-6 text-xs text-zinc-800 dark:text-zinc-200">
      
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block">
          Search IoT Hardware
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sensors, boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-[#111218] transition text-zinc-900 dark:text-zinc-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Horizontal Line Price Range Slider */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-extrabold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
              <span>₹0</span>
              <span className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-0.5 rounded-md border border-violet-200 dark:border-violet-800/40 font-mono">
                Max: ₹{priceLimit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Horizontal Slider Line */}
            <div className="relative pt-1">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={50}
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                <span>₹0</span>
                <span>₹{(maxPrice / 2).toLocaleString('en-IN')}</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Color Circles Filter (Replaced category) */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between font-extrabold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest"
        >
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-violet-500" />
            <span>Color Swatches</span>
          </div>
          {openSections.colors ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {openSections.colors && (
          <div className="pt-1">
            <div className="grid grid-cols-4 gap-2.5">
              {availableColorSwatches.map((c) => {
                const isSelected = selectedColors.includes(c.name);
                const isWhite = c.value.toLowerCase() === '#ffffff' || c.value.toLowerCase() === 'white';
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColor(c.name)}
                    title={c.name}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div
                      className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${isSelected
                        ? 'ring-2 ring-violet-600 dark:ring-violet-400 border-white ring-offset-2 ring-offset-white dark:ring-offset-[#111218] scale-105'
                        : 'border-zinc-300 dark:border-zinc-700 hover:scale-105'
                        }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {isSelected && (
                        <Check className={`h-3.5 w-3.5 ${isWhite ? 'text-zinc-900' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'}`} />
                      )}
                    </div>
                    <span className={`text-[9px] truncate max-w-full font-semibold ${isSelected ? 'text-violet-600 dark:text-violet-400 font-extrabold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Hardware / Material Filter */}
      {materialsList.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2.5">
          <button
            onClick={() => toggleSection('materials')}
            className="w-full flex items-center justify-between font-extrabold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest"
          >
            <span>Hardware Specs</span>
            {openSections.materials ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
          </button>

          {openSections.materials && (
            <div className="space-y-1.5 pt-1">
              {materialsList.map((mat) => {
                const isSelected = selectedMaterials.includes(mat);
                return (
                  <button
                    key={mat}
                    onClick={() => toggleMaterial(mat)}
                    className="w-full flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-left transition select-none"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                    )}
                    <span className={`text-xs ${isSelected ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {mat}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Minimum Rating Filter */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2.5">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between font-extrabold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest"
        >
          <span>Rating</span>
          {openSections.rating ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {openSections.rating && (
          <div className="space-y-1 pt-1">
            {[4, 3, 2].map((stars) => {
              const isSelected = minRating === stars;
              return (
                <button
                  key={stars}
                  onClick={() => setMinRating(isSelected ? 0 : stars)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition ${isSelected ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold ml-1">&amp; Up</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Status / Special Toggles */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2.5">
        <button
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between font-extrabold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest"
        >
          <span>Availability &amp; Offers</span>
          {openSections.status ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {openSections.status && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between cursor-pointer select-none px-1">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer select-none px-1">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Discounted / On Sale</span>
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={resetAllFilters}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50/60 dark:bg-[#090a0f] pt-24 pb-20 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Minimal Clean Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="inline-flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Home
              </Link>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">IoT Catalog</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                IoT &amp; Hardware Components
              </h1>
              {!isLoading && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
                  {processedProducts.length} items
                </span>
              )}
            </div>
          </div>

          {/* Right Action Bar: Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#111218] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm"
            >
              <Filter className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white dark:bg-[#111218] border border-zinc-200/90 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-violet-500 shadow-sm text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Filter Sidebar + Right Product Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filter (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <h2 className="text-sm font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Filter Products
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <FilterSidebarContent />
          </div>

          {/* Right Product Grid Area (9 Cols) */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Active Filter Badges Pill Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-zinc-800/80 p-3 rounded-xl shadow-sm text-xs">
                <span className="text-zinc-400 font-bold text-[10px] uppercase">Active:</span>
                {priceLimit < maxPrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    Max ₹{priceLimit.toLocaleString('en-IN')}
                    <button onClick={() => setPriceLimit(maxPrice)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedColors.map((color) => (
                  <span key={color} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    Color: {color}
                    <button onClick={() => toggleColor(color)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedMaterials.map((mat) => (
                  <span key={mat} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    Spec: {mat}
                    <button onClick={() => toggleMaterial(mat)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    Rating: {minRating}★ &amp; Up
                    <button onClick={() => setMinRating(0)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    On Sale
                    <button onClick={() => setOnSaleOnly(false)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-semibold text-[11px]">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Cards Grid / Loading / Empty */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-sm"
                  >
                    <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800/40 rounded w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/3" />
                      <div className="h-8 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-4 shadow-sm">
                <Cpu className="h-10 w-10 text-zinc-400 mx-auto opacity-60" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">No Matching IoT Products</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    We couldn't find any IoT hardware matching your active filters.
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedQuickViewProduct(p)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#111218] h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Filter Products
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterSidebarContent />

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
              >
                View ({processedProducts.length}) Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedQuickViewProduct && (
        <QuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <Toast message={toastMessage} />
    </main>
  );
}
