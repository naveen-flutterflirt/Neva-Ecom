'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Eye,
  Trash2,
  Plus,
  Flame,
  Tag,
  ShoppingBag,
  Percent,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { apiClient } from '../../../lib/api';

interface Product {
  id: string;
  name: string;
  price: string | number;
  discountPrice?: string | number | null;
  sku: string;
  category?: { id: string; name: string } | null;
  images?: { id: string; imageUrl: string; isPrimary: boolean }[];
}

interface PopupBanner {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string | null;
  productId: string | null;
  customDiscountPercentage: number | null;
  couponCode: string | null;
  buttonText: string;
  targetUrl: string | null;
  isActive: boolean;
  product?: Product | null;
}

export default function AdminPopupBannerPage() {
  const [banners, setBanners] = useState<PopupBanner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('Special Deal of the Day!');
  const [subtitle, setSubtitle] = useState('Limited time offer on featured hardware');
  const [badgeText, setBadgeText] = useState('Flash Deal 🔥');
  const [productId, setProductId] = useState<string>('');
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState<string>('20');
  const [couponCode, setCouponCode] = useState<string>('OFFER50');
  const [buttonText, setButtonText] = useState<string>('Claim Offer & Buy Now');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes, couponsRes] = await Promise.all([
        apiClient('/popup-banners'),
        apiClient('/products'),
        apiClient('/coupons/public').catch(() => null),
      ]);

      if (bannersRes && bannersRes.success) {
        setBanners(bannersRes.data || []);
        // If there's an existing active banner, populate form with it
        const active = (bannersRes.data || []).find((b: PopupBanner) => b.isActive) || bannersRes.data?.[0];
        if (active) {
          setEditingId(active.id);
          setTitle(active.title || '');
          setSubtitle(active.subtitle || '');
          setBadgeText(active.badgeText || 'Flash Deal 🔥');
          setProductId(active.productId || '');
          setCustomDiscountPercentage(active.customDiscountPercentage ? String(active.customDiscountPercentage) : '');
          setCouponCode(active.couponCode || '');
          setButtonText(active.buttonText || 'Claim Offer & Buy Now');
          setTargetUrl(active.targetUrl || '');
          setIsActive(Boolean(active.isActive));
        }
      }

      if (productsRes && productsRes.success) {
        setProducts(productsRes.data || []);
      }

      if (couponsRes && couponsRes.success && couponsRes.data) {
        setAvailableCoupons(couponsRes.data);
      }
    } catch (err: any) {
      console.warn('Failed to load popup banner data:', err);
      showToast('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const selected = products.find((p) => p.id === id);
    if (selected) {
      setTitle(`Exclusive Deal: ${selected.name}`);
      setSubtitle(`Limited festive savings available on SKU: ${selected.sku}`);
      setTargetUrl(`/products/${selected.id}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        id: editingId,
        title,
        subtitle,
        badgeText,
        productId: productId || null,
        customDiscountPercentage: customDiscountPercentage ? parseInt(customDiscountPercentage, 10) : null,
        couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
        buttonText,
        targetUrl,
        isActive,
      };

      const res = await apiClient('/popup-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        showToast('🎉 Popup Banner configuration saved & updated live!');
        fetchData();
      } else {
        showToast(res?.message || 'Failed to save banner');
      }
    } catch (err: any) {
      showToast('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this popup banner?')) return;
    try {
      const res = await apiClient(`/popup-banners/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        showToast('Banner deleted successfully');
        fetchData();
      }
    } catch (err: any) {
      showToast('Failed to delete: ' + err.message);
    }
  };

  const handleNewOffer = () => {
    setEditingId(null);
    setTitle('Special Deal of the Day!');
    setSubtitle('Limited festive savings available on featured items');
    setBadgeText('Special Deal 🔥');
    setProductId('');
    setCustomDiscountPercentage('20');
    setCouponCode('OFFER50');
    setButtonText('Claim Deal & View Product');
    setTargetUrl('');
    setIsActive(true);
    showToast('Ready to configure new offer banner');
  };

  const handleEditBanner = (b: PopupBanner) => {
    setEditingId(b.id);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setBadgeText(b.badgeText || 'Special Deal 🔥');
    setProductId(b.productId || '');
    setCustomDiscountPercentage(b.customDiscountPercentage ? String(b.customDiscountPercentage) : '');
    setCouponCode(b.couponCode || '');
    setButtonText(b.buttonText || 'Claim Deal & View Product');
    setTargetUrl(b.targetUrl || '');
    setIsActive(Boolean(b.isActive));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedProduct = products.find((p) => p.id === productId);
  const primaryImage = selectedProduct?.images?.find((img) => img.isPrimary) || selectedProduct?.images?.[0];

  return (
    <div className="space-y-6">
      {/* Page Header with "Add New Offer" button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
            Website Popup Deal Banners (Multi-Offer Carousel)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Create single or multiple offer banners (Combo, BOGO, or Launch deals). Multiple active banners automatically slide as a carousel for visitors!
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewOffer}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Offer Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Editor */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5"
          >
            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 block">
                    Show Popup On Website Visit
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    When enabled, visitors will see this offer banner popup upon opening the site
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Choose Product / Component */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
                Select Product or Component to Feature
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
              >
                <option value="">-- Choose a Product or Component --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku}) — ₹{p.discountPrice || p.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Banner Header Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Popup Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Special Deal of the Day!"
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Limited time offer on featured hardware"
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            {/* Grid 2 Column: Badge & Discount % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Flash Deal 🔥 or Festive Special"
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-rose-500" />
                  Special Deal Discount % (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={customDiscountPercentage}
                  onChange={(e) => setCustomDiscountPercentage(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Grid 2 Column: Coupon Code & Button Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                    Attach Coupon Code (Optional)
                  </span>
                  {couponCode && (
                    <button
                      type="button"
                      onClick={() => setCouponCode('')}
                      className="text-[10px] text-zinc-400 hover:text-rose-500 font-semibold"
                    >
                      Remove Coupon
                    </button>
                  )}
                </label>

                {/* Dropdown Select for Available Coupons */}
                <select
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none font-semibold focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- No Attached Coupon --</option>
                  {availableCoupons.map((c) => (
                    <option key={c.id || c.code} value={c.code}>
                      🏷️ {c.code} — {c.discountType === 'flat' ? `Flat ₹${c.discountValue} OFF` : `${c.discountValue}% OFF`} {c.description ? `(${c.description})` : ''}
                    </option>
                  ))}
                </select>

                {/* Quick Pick Pills */}
                {availableCoupons.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-zinc-400 font-medium">Select:</span>
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCouponCode(c.code)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                          couponCode === c.code
                            ? 'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {c.code} ({c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-zinc-400" />
                  Button Action Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. Claim Offer & Buy Now"
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Custom Destination URL (for Combos, Bundles, or Special Landing Pages) */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
                  Custom Destination URL (Optional)
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  Auto-fills when product is chosen, or enter custom combo link
                </span>
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="e.g. /products/combo-kit or /iot-kits or /cart"
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Offer Type Quick Presets */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBadgeText('COMBO DEAL 🎁');
                    setTitle('Festive Duo Combo: Buy 1 Device & Get 50% Off 2nd');
                    setSubtitle('Exclusive limited combo bundle with instant discount code');
                    setButtonText('Grab Combo Offer Now');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition hover:scale-105"
                >
                  🎁 Combo Deal Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBadgeText('BUY 1 GET 1 FREE 🔥');
                    setTitle('Special BOGO Fest: Buy 1 Get 1 Free');
                    setSubtitle('Add qualifying item to cart and apply code for 100% off companion');
                    setButtonText('Claim BOGO Free Deal');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 transition hover:scale-105"
                >
                  🔥 BOGO (Buy 1 Get 1) Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBadgeText('FLASH SALE ⚡');
                    setTitle('Special Flash Discount: Flat ₹50 OFF');
                    setSubtitle('Limited stock available at exclusive promotional price');
                    setButtonText('Claim Deal & View Product');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 transition hover:scale-105"
                >
                  ⚡ Flash Sale Template
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Publish & Update Live Popup Banner</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-amber-500" />
              Live Visitor Popup Preview
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {isActive ? '🟢 Active On Site' : '⚪ Inactive'}
            </span>
          </div>

          {/* Interactive Mock Preview Card - Premium Royal Indigo Design */}
          <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#080b18] border border-slate-200 dark:border-indigo-950 shadow-xl">
            {/* Header */}
            <div className="bg-slate-900 dark:bg-[#0c1022] p-5 text-white text-center border-b border-indigo-950/60 dark:border-indigo-900/40">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
                <Sparkles className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span>{badgeText || 'Special Deal 🔥'}</span>
              </div>
              <h4 className="text-lg font-black tracking-tight text-white">
                {title || 'Popup Title'}
              </h4>
              {subtitle && (
                <p className="text-[11px] text-indigo-200 mt-1 max-w-xs mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Product Body */}
            <div className="p-4 space-y-3">
              {selectedProduct ? (
                <div className="flex items-center gap-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-slate-50/80 dark:bg-[#0e1328] p-3 shadow-xs">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white dark:bg-[#131934] border border-slate-200 shrink-0 flex items-center justify-center">
                    {primaryImage ? (
                      <img
                        src={primaryImage.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-slate-400" />
                    )}
                    {customDiscountPercentage && (
                      <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-rose-600 text-white font-black text-[8px] uppercase tracking-wider shadow-sm">
                        {customDiscountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">
                      {selectedProduct.category?.name || 'Featured Hardware'}
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {selectedProduct.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        ₹{customDiscountPercentage
                          ? Math.round(parseFloat(String(selectedProduct.discountPrice || selectedProduct.price)) * (1 - parseInt(customDiscountPercentage, 10) / 100)).toLocaleString('en-IN')
                          : selectedProduct.discountPrice || selectedProduct.price}
                      </span>
                      {selectedProduct.discountPrice && (
                        <span className="text-[10px] font-mono text-slate-400 line-through">
                          ₹{selectedProduct.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Combo / Multi-Item Card Preview */
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-slate-50/90 dark:bg-[#0e1328] p-3.5 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-950 text-amber-400 flex items-center justify-center shrink-0 border border-indigo-800">
                      <Sparkles className="h-6 w-6 fill-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-amber-400 block">
                        Multi-Item / Combo Template
                      </span>
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {title || 'Combo Offer Package'}
                      </h5>
                    </div>
                  </div>
                  {targetUrl && (
                    <div className="text-[10px] text-slate-500 dark:text-indigo-300 font-mono flex items-center justify-between border-t border-indigo-100 dark:border-indigo-950 pt-2">
                      <span>Destination:</span>
                      <span className="font-bold text-indigo-600 dark:text-amber-400 truncate max-w-[170px]">{targetUrl}</span>
                    </div>
                  )}
                </div>
              )}

              {couponCode && (
                <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-[#0e142e] p-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-indigo-200">
                    Coupon: <span className="font-mono text-amber-600 dark:text-amber-400">{couponCode}</span>
                  </span>
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                    COPY
                  </span>
                </div>
              )}

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm pointer-events-none text-center"
              >
                {buttonText || 'Claim Offer & Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Saved Popup Banners Table (Multi-offer Carousel Manager) */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              All Saved Popup Deal Banners ({banners.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              All active banners (🟢) rotate automatically in the visitor popup carousel.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewOffer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Another Banner</span>
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            No banners created yet. Fill out the form above to publish your first offer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Title & Badge</th>
                  <th className="py-3 px-4 font-bold">Product / Offer</th>
                  <th className="py-3 px-4 font-bold">Discount / Coupon</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {banners.map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition ${
                      editingId === b.id ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {b.isActive ? '🟢 Active' : '⚪ Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{b.title}</div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        {b.badgeText || 'Special Deal'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
                        {b.product?.name || (b.productId ? 'Product Linked' : 'Direct Link')}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {b.customDiscountPercentage && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                            {b.customDiscountPercentage}% OFF
                          </span>
                        )}
                        {b.couponCode && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px]">
                            {b.couponCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditBanner(b)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 transition"
                          title="Delete banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
