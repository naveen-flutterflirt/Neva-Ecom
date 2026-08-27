'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Check,
  Video as VideoIcon,
  Sparkles
} from 'lucide-react';
import Toast from '../../../../components/ui/Toast';
import Pagination from '../../../../components/ui/Pagination';
import { TableSkeletonRows } from '../../../../components/ui/Skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  mediaType: 'image' | 'video';
}

interface MaterialVariant {
  name: string;
  priceAdjustment: number;
}

interface ColorOption {
  name: string;
  code: string;
  priceAdjustment: number;
  imageUrl?: string;
}

interface SizeVariant {
  name: string;
  priceAdjustment: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  discountPrice: string | null;
  stock: number;
  status: 'draft' | 'active' | 'out_of_stock';
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;
  images: ProductImage[];
  materialVariants?: MaterialVariant[];
  colorOptions?: ColorOption[];
  sizeVariants?: SizeVariant[];
  careInstructions?: string[];
  keyFeatures?: { title: string; description: string }[];
  specifications?: Record<string, any>;
  sortOrder?: number;
}

const PRESET_COLOR_CHART = [
  { name: 'Onyx Black', code: '#121212', priceAdjustment: 0 },
  { name: 'Signal White', code: '#ffffff', priceAdjustment: 0 },
  { name: 'Lumina Violet', code: '#a855f7', priceAdjustment: 50 },
  { name: 'Electric Cyan', code: '#22d3ee', priceAdjustment: 50 },
  { name: 'Signal Pink', code: '#ec4899', priceAdjustment: 50 },
  { name: 'Core Green', code: '#10b981', priceAdjustment: 0 },
  { name: 'Nexus Blue', code: '#3b82f6', priceAdjustment: 0 },
  { name: 'Fire Red', code: '#ef4444', priceAdjustment: 0 },
  { name: 'Solar Yellow', code: '#eab308', priceAdjustment: 0 },
  { name: 'Satin Orange', code: '#f97316', priceAdjustment: 0 },
  { name: 'Titanium Silver', code: '#94a3b8', priceAdjustment: 100 },
  { name: 'Muted Slate', code: '#64748b', priceAdjustment: 0 },
  { name: 'Emerald Jade', code: '#059669', priceAdjustment: 50 },
  { name: 'Gold Bronze', code: '#d97706', priceAdjustment: 150 },
  { name: 'Matte Grey', code: '#475569', priceAdjustment: 0 },
  { name: 'Deep Indigo', code: '#4338ca', priceAdjustment: 50 },
];

import { API_URL } from '../../../../lib/api';

const API_BASE = API_URL;
const PRODUCTS_API = `${API_BASE}/products`;
const CATEGORIES_API = `${API_BASE}/categories`;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Color Chart Modal
  const [isColorChartOpen, setIsColorChartOpen] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Input States
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'out_of_stock'>('draft');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [autoSku, setAutoSku] = useState(true);
  const [sortOrder, setSortOrder] = useState<string>('0');

  // Category-based Variant & Attributes States
  const [materialVariants, setMaterialVariants] = useState<MaterialVariant[]>([]);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [colorImageFilesMap, setColorImageFilesMap] = useState<{ [key: number]: File }>({});
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [careInstructions, setCareInstructions] = useState<string[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<{ title: string; description: string }[]>([]);
  const [specifications, setSpecifications] = useState<{
    material?: string;
    electronics?: string;
    power?: string;
    connectivity?: string;
    dimensions?: string;
  }>({});

  // Unified Media Upload States
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);

  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  // Existing Media (for edit mode)
  const [existingMedia, setExistingMedia] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch Products & Categories in parallel (Optimized concurrency)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(PRODUCTS_API),
        fetch(CATEGORIES_API)
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.data || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      console.warn('API connection failed. Fallback to empty state. Error:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto SKU logic
  useEffect(() => {
    if (autoSku && name && modalMode === 'create') {
      const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      const code = `${initials}-${Date.now().toString().slice(-4)}`;
      setSku(code);
    }
  }, [name, autoSku, modalMode]);

  // Unified File upload state handler with 5MB validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit

      const validImages: File[] = [];
      const validVideos: File[] = [];
      const newImagePreviews: string[] = [];
      const newVideoPreviews: string[] = [];

      for (const file of filesArray) {
        if (file.size > MAX_SIZE) {
          showToast(`"${file.name}" is over 5MB limit! ❌`);
          continue;
        }

        if (file.type.startsWith('image/')) {
          validImages.push(file);
          newImagePreviews.push(URL.createObjectURL(file));
        } else if (file.type.startsWith('video/')) {
          validVideos.push(file);
          newVideoPreviews.push(URL.createObjectURL(file));
        } else {
          showToast(`Unsupported format: ${file.name}`);
        }
      }

      if (validImages.length > 0) {
        setSelectedImageFiles(prev => [...prev, ...validImages]);
        setImagePreviews(prev => [...prev, ...newImagePreviews]);
      }
      if (validVideos.length > 0) {
        setSelectedVideoFiles(prev => [...prev, ...validVideos]);
        setVideoPreviews(prev => [...prev, ...newVideoPreviews]);
      }
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryIndex === index) {
      setPrimaryIndex(0);
    } else if (primaryIndex > index) {
      setPrimaryIndex(prev => prev - 1);
    }
  };

  const removeSelectedVideo = (index: number) => {
    setSelectedVideoFiles(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (mediaId: string) => {
    setDeletedImageIds(prev => [...prev, mediaId]);
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProductId(null);
    setName('');
    setSku('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setDiscountPrice('');
    setStock('');
    setDescription('');
    setStatus('active');
    setIsNewArrival(true);
    setAutoSku(true);
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setSelectedVideoFiles([]);
    setVideoPreviews([]);
    setExistingMedia([]);
    setDeletedImageIds([]);
    setPrimaryIndex(0);
    setSortOrder('0');

    setMaterialVariants([
      { name: 'Tough PLA (Base)', priceAdjustment: 0 },
      { name: 'PETG', priceAdjustment: 150 },
      { name: 'ABS', priceAdjustment: 200 }
    ]);
    setColorOptions([
      { name: 'Black', code: '#000000', priceAdjustment: 0 },
      { name: 'Signal White', code: '#ffffff', priceAdjustment: 0 },
      { name: 'Electric Cyan', code: '#22d3ee', priceAdjustment: 50 }
    ]);
    setSizeVariants([
      { name: '4 Inch', priceAdjustment: 0 },
      { name: '6 Inch', priceAdjustment: 100 },
      { name: '8 Inch', priceAdjustment: 250 },
      { name: '14 Inch', priceAdjustment: 500 }
    ]);
    setCareInstructions([
      'Wipe exterior with a dry micro-fiber cloth. Avoid getting water on the facial display.',
      'Ensure the inner moisture sensor is fully inserted into the soil for accurate readings.',
      'Keep away from direct heat sources to protect the 3D-printed enclosure.'
    ]);
    setKeyFeatures([
      { title: 'Interactive Emoji Face', description: 'Real-time emotion & status facial display screen' },
      { title: 'Real-time Moisture Tracking', description: 'Capacitive soil moisture sensor integration' },
      { title: 'App-controlled RGB Base', description: 'Wireless Bluetooth & Wi-Fi smart control' },
      { title: 'Open-Source Firmware', description: 'ESP32-S3 fully customizable codebase' }
    ]);

    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProductId(product.id);
    setName(product.name);
    setSku(product.sku);
    setCategoryId(product.categoryId);
    setPrice(product.price);
    setDiscountPrice(product.discountPrice || '');
    setStock(product.stock.toString());
    setDescription(product.description || '');
    setStatus(product.status);
    setIsNewArrival(!!(product as any).isNewArrival);
    setAutoSku(false);
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setSelectedVideoFiles([]);
    setVideoPreviews([]);
    setExistingMedia(product.images || []);
    setDeletedImageIds([]);
    setSortOrder(String(product.sortOrder ?? 0));

    let parsedColorOpts: ColorOption[] = [];
    if (product.colorOptions) {
      if (typeof product.colorOptions === 'string') {
        try { parsedColorOpts = JSON.parse(product.colorOptions); } catch (e) { parsedColorOpts = []; }
      } else if (Array.isArray(product.colorOptions)) {
        parsedColorOpts = product.colorOptions;
      }
    }
    setColorOptions(parsedColorOpts);

    let parsedMatOpts: MaterialVariant[] = [];
    if (product.materialVariants) {
      if (typeof product.materialVariants === 'string') {
        try { parsedMatOpts = JSON.parse(product.materialVariants); } catch (e) { parsedMatOpts = []; }
      } else if (Array.isArray(product.materialVariants)) {
        parsedMatOpts = product.materialVariants;
      }
    }
    setMaterialVariants(parsedMatOpts);

    let parsedSizeOpts: SizeVariant[] = [];
    if (product.sizeVariants) {
      if (typeof product.sizeVariants === 'string') {
        try { parsedSizeOpts = JSON.parse(product.sizeVariants); } catch (e) { parsedSizeOpts = []; }
      } else if (Array.isArray(product.sizeVariants)) {
        parsedSizeOpts = product.sizeVariants;
      }
    }
    setSizeVariants(parsedSizeOpts);

    // Safely parse JSON or array fields for careInstructions and keyFeatures
    let parsedCare: string[] = [];
    if (product.careInstructions) {
      if (typeof product.careInstructions === 'string') {
        try { parsedCare = JSON.parse(product.careInstructions); } catch (e) { parsedCare = []; }
      } else if (Array.isArray(product.careInstructions)) {
        parsedCare = product.careInstructions;
      }
    }
    setCareInstructions(parsedCare);

    let parsedFeatures: { title: string; description: string }[] = [];
    if (product.keyFeatures) {
      if (typeof product.keyFeatures === 'string') {
        try { parsedFeatures = JSON.parse(product.keyFeatures); } catch (e) { parsedFeatures = []; }
      } else if (Array.isArray(product.keyFeatures)) {
        parsedFeatures = product.keyFeatures;
      }
    }
    setKeyFeatures(parsedFeatures);
    setSpecifications(product.specifications || {});

    // Find primary image index (defaulting null mediaType to image)
    const primaryIdx = (product.images || [])
      .filter(img => (img.mediaType || 'image') === 'image')
      .findIndex(img => img.isPrimary);
    setPrimaryIndex(primaryIdx >= 0 ? primaryIdx : 0);

    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('categoryId', categoryId);
    formData.append('price', price);
    formData.append('discountPrice', discountPrice);
    formData.append('stock', stock);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('isNewArrival', isNewArrival.toString());
    formData.append('primaryImageIndex', primaryIndex.toString());
    formData.append('sortOrder', sortOrder || '0');

    // Append JSON Variant & Spec Fields
    formData.append('materialVariants', JSON.stringify(materialVariants));
    formData.append('colorOptions', JSON.stringify(colorOptions));
    formData.append('sizeVariants', JSON.stringify(sizeVariants));
    formData.append('careInstructions', JSON.stringify(careInstructions));
    formData.append('keyFeatures', JSON.stringify(keyFeatures));
    formData.append('specifications', JSON.stringify(specifications));

    // Append images
    selectedImageFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append videos
    selectedVideoFiles.forEach((file) => {
      formData.append('videos', file);
    });

    // Append color option image files (uploaded to S3)
    Object.entries(colorImageFilesMap).forEach(([colorIdxStr, file]) => {
      formData.append('colorImages', file);
      formData.append('colorImageIndices', colorIdxStr);
    });

    // Append deleted existing media IDs
    if (modalMode === 'edit') {
      deletedImageIds.forEach((id) => {
        formData.append('deletedImageIds', id);
      });
    }

    try {
      const url = modalMode === 'create' ? PRODUCTS_API : `${PRODUCTS_API}/${selectedProductId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        await fetchData();
        showToast(modalMode === 'create' ? 'Product created successfully! 🎉' : 'Product updated successfully! ⚡');
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API sync failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;
    setDeletingId(id);

    try {
      const response = await fetch(`${PRODUCTS_API}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchData();
        showToast('Product deleted successfully! 🗑️');
      } else {
        throw new Error('API delete failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredProducts = products.filter((prod) => {
    const query = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.sku.toLowerCase().includes(query) ||
      (prod.description && prod.description.toLowerCase().includes(query))
    );
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Products Catalog</h1>
          <p className="mt-1 text-sm text-zinc-500">Add, edit, upload, and update products in your catalog.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10">
        <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search products SKU, name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Main Grid table view */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-3 w-14">No</th>
                <th className="px-6 py-3 w-16">Image</th>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {loading ? (
                <TableSkeletonRows rows={6} cols={9} />
              ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-400">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, index) => {
                    const primaryImg = (product.images || []).find(img => img.isPrimary && (img.mediaType || 'image') === 'image') || (product.images || []).find(img => (img.mediaType || 'image') === 'image');
                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-zinc-50 transition-colors duration-150 ${deletingId === product.id ? 'opacity-40 pointer-events-none bg-red-50' : ''
                          }`}
                      >
                        <td className="px-6 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-6 py-3.5">
                          {primaryImg ? (
                            <img
                              src={primaryImg.imageUrl}
                              alt={product.name}
                              className="h-9 w-9 rounded-lg object-cover border border-zinc-200 shadow-sm"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 text-zinc-400">
                              <ImageIcon className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-zinc-900 text-xs">{product.name}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-[11px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">{product.sku}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[11px] bg-zinc-100 border border-zinc-200 rounded-md px-2 py-0.5 text-zinc-700 font-medium">
                            {product.category?.name || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          {product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-900 text-xs">₹{product.discountPrice}</span>
                              <span className="text-[10px] text-zinc-400 line-through">₹{product.price}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-zinc-900 text-xs">₹{product.price}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-xs font-semibold ${product.stock <= 5 ? 'text-amber-600' : 'text-zinc-700'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            product.status === 'out_of_stock' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-zinc-100 text-zinc-500 border-zinc-200'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' :
                              product.status === 'out_of_stock' ? 'bg-red-500' : 'bg-zinc-400'
                              }`} />
                            {product.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>

      {/* Save Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900">
                {modalMode === 'create' ? 'Upload New Product' : 'Edit Catalog Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition disabled:opacity-30"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 pb-2 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. PLA Filament Neon Red"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      SKU Code
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-zinc-500 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={isSaving}
                        checked={autoSku}
                        onChange={(e) => setAutoSku(e.target.checked)}
                        className="rounded border-zinc-350 text-violet-600 focus:ring-violet-400 h-3 w-3 disabled:opacity-60"
                      />
                      Auto-generate
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={autoSku || isSaving}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. PLA-RD-001"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    required
                    disabled={isSaving}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSaving}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2499.00"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Discount Price (₹ - Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={isSaving}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="1999.00"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Stock Inventory Quantity
                  </label>
                  <input
                    type="number"
                    required
                    disabled={isSaving}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5 font-bold">
                    Display Rank (e.g. 1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={isSaving}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="1"
                    className="w-full rounded-xl border border-violet-300 bg-violet-50/50 px-3 py-2 text-xs font-bold text-violet-900 outline-none focus:border-violet-600 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Product Listing Status
                  </label>
                  <select
                    value={status}
                    disabled={isSaving}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="active">Active (Visible)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Show in New Arrivals Toggle Card */}
              <div className="flex items-center justify-between p-3.5 border border-pink-200/80 bg-gradient-to-r from-pink-50/60 to-purple-50/60 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900 block">Show in New Arrivals Section</span>
                    <span className="text-[10px] text-zinc-500 block">Feature this product in the New Arrivals section on the homepage</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    disabled={isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  disabled={isSaving}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insert complete specifications and information..."
                  rows={4}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white resize-none disabled:opacity-60"
                />
              </div>

              {/* 1. Material Variants Section */}
              <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Material Variants &amp; Price Adjustments
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaterialVariants(prev => [...prev, { name: 'New Material', priceAdjustment: 0 }])}
                    className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Material
                  </button>
                </div>
                <div className="space-y-2">
                  {materialVariants.map((mat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
                      <input
                        type="text"
                        value={mat.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMaterialVariants(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                        }}
                        placeholder="Material Name (e.g. PETG)"
                        className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-zinc-400 font-semibold">+₹</span>
                        <input
                          type="number"
                          value={mat.priceAdjustment}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMaterialVariants(prev => prev.map((m, i) => i === idx ? { ...m, priceAdjustment: val } : m));
                          }}
                          placeholder="0"
                          className="w-20 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-violet-500 text-center font-mono font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaterialVariants(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-red-500 hover:text-red-700 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Color Options Section */}
              <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Color Options
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveColorIndex(null);
                        setIsColorChartOpen(true);
                      }}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-200 transition shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" /> Open Color Chart
                    </button>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {colorOptions.map((col, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={col.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, code: val } : c));
                          }}
                          className="h-7 w-7 rounded-lg cursor-pointer border border-zinc-200 p-0.5"
                        />
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, name: val } : c));
                          }}
                          placeholder="Color Name (e.g. Electric Cyan)"
                          className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500 font-bold"
                        />
                        <input
                          type="text"
                          value={col.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, code: val } : c));
                          }}
                          placeholder="#000000"
                          className="w-24 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-mono outline-none focus:border-violet-500 uppercase"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-zinc-400 font-semibold">+₹</span>
                          <input
                            type="number"
                            value={col.priceAdjustment || 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, priceAdjustment: val } : c));
                            }}
                            placeholder="0"
                            className="w-20 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-violet-500 text-center font-mono font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setColorOptions(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-red-500 hover:text-red-700 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Color Variant Image File Upload & Selector */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
                        <span className="text-[11px] font-bold text-zinc-600 flex items-center gap-1 shrink-0">
                          <ImageIcon className="h-3.5 w-3.5 text-violet-600" />
                          Color Variant Image:
                        </span>

                        {/* File Upload Input Button */}
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold cursor-pointer transition">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const previewUrl = URL.createObjectURL(file);
                                setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, imageUrl: previewUrl } : c));
                                setColorImageFilesMap(prev => ({ ...prev, [idx]: file }));
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {/* Select From Uploaded Product Gallery */}
                        {imagePreviews.length > 0 && (
                          <select
                            value={col.imageUrl || ''}
                            onChange={(e) => {
                              const selectedUrl = e.target.value;
                              setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, imageUrl: selectedUrl } : c));
                            }}
                            className="flex-1 min-w-[140px] rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-violet-500 bg-white font-medium text-zinc-700"
                          >
                            <option value="">Choose from uploaded gallery...</option>
                            {imagePreviews.map((url, imgIdx) => (
                              <option key={imgIdx} value={url}>
                                Gallery Image #{imgIdx + 1}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Image Preview Thumbnail & Remove Button */}
                        {col.imageUrl ? (
                          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg">
                            <img src={col.imageUrl} alt="" className="h-6 w-6 rounded object-contain bg-white border border-zinc-200" />
                            <span className="text-[10px] font-semibold text-zinc-600 max-w-[90px] truncate">Image Selected</span>
                            <button
                              type="button"
                              onClick={() => {
                                setColorOptions(prev => prev.map((c, i) => i === idx ? { ...c, imageUrl: '' } : c));
                                setColorImageFilesMap(prev => {
                                  const copy = { ...prev };
                                  delete copy[idx];
                                  return copy;
                                });
                              }}
                              className="text-zinc-400 hover:text-red-500 transition ml-0.5"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">No image uploaded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Helper */}
              {(() => {
                const selectedCategory = categories.find(c => c.id === categoryId);
                const isIotCategory = selectedCategory
                  ? selectedCategory.slug.toLowerCase().includes('iot') || selectedCategory.name.toLowerCase().includes('iot')
                  : false;

                return (
                  <>
                    {!isIotCategory ? (
                      <>
                        {/* 3D Product: Size Variants Section */}
                        <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Size Variants &amp; Price Adjustments
                            </label>
                            <button
                              type="button"
                              onClick={() => setSizeVariants(prev => [...prev, { name: 'New Size', priceAdjustment: 0 }])}
                              className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Size
                            </button>
                          </div>
                          <div className="space-y-2">
                            {sizeVariants.map((sz, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
                                <input
                                  type="text"
                                  value={sz.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSizeVariants(prev => prev.map((s, i) => i === idx ? { ...s, name: val } : s));
                                  }}
                                  placeholder="Size Name (e.g. 8 Inch)"
                                  className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-zinc-400 font-semibold">+₹</span>
                                  <input
                                    type="number"
                                    value={sz.priceAdjustment}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setSizeVariants(prev => prev.map((s, i) => i === idx ? { ...s, priceAdjustment: val } : s));
                                    }}
                                    placeholder="0"
                                    className="w-20 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-violet-500 text-center font-mono font-bold"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSizeVariants(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-red-500 hover:text-red-700 transition"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3D Product: Key Features & Care Cards */}
                        <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Key Features &amp; Care Cards
                            </label>
                            <button
                              type="button"
                              onClick={() => setKeyFeatures(prev => [...prev, { title: 'New Feature', description: 'Feature description...' }])}
                              className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Feature Card
                            </button>
                          </div>
                          <div className="space-y-3">
                            {keyFeatures.map((feat, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={feat.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setKeyFeatures(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                                    }}
                                    placeholder="Title (e.g. Preserve Vibrancy)"
                                    className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-violet-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setKeyFeatures(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1.5 text-red-500 hover:text-red-700 transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  value={feat.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setKeyFeatures(prev => prev.map((item, i) => i === idx ? { ...item, description: val } : item));
                                  }}
                                  placeholder="Feature description..."
                                  rows={2}
                                  className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500 resize-none text-zinc-650"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* IoT Product: Care Instructions Section */}
                        <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Care Instructions
                            </label>
                            <button
                              type="button"
                              onClick={() => setCareInstructions(prev => [...prev, 'New care instruction statement.'])}
                              className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Instruction
                            </button>
                          </div>
                          <div className="space-y-2">
                            {careInstructions.map((inst, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
                                <span className="text-zinc-400 text-xs font-bold font-mono pl-1">•</span>
                                <input
                                  type="text"
                                  value={inst}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCareInstructions(prev => prev.map((item, i) => i === idx ? val : item));
                                  }}
                                  placeholder="e.g. Wipe clean with dry cloth"
                                  className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setCareInstructions(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-red-500 hover:text-red-700 transition"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* IoT Product: Key Features Cards */}
                        <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Key Features Cards
                            </label>
                            <button
                              type="button"
                              onClick={() => setKeyFeatures(prev => [...prev, { title: 'New Feature', description: 'Feature description...' }])}
                              className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Feature Card
                            </button>
                          </div>
                          <div className="space-y-3">
                            {keyFeatures.map((feat, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={feat.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setKeyFeatures(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                                    }}
                                    placeholder="Title (e.g. Interactive Display)"
                                    className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-violet-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setKeyFeatures(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1.5 text-red-500 hover:text-red-700 transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  value={feat.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setKeyFeatures(prev => prev.map((item, i) => i === idx ? { ...item, description: val } : item));
                                  }}
                                  placeholder="Feature description..."
                                  rows={2}
                                  className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-500 resize-none text-zinc-650"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* IoT Product: Technical Specifications Grid */}
                        <div className="space-y-3 border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            Product Technical Specifications (IoT / Hardware)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Material</label>
                              <input
                                type="text"
                                value={specifications.material || ''}
                                onChange={(e) => setSpecifications(prev => ({ ...prev, material: e.target.value }))}
                                placeholder="e.g. Tough PLA / PETG"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Electronics</label>
                              <input
                                type="text"
                                value={specifications.electronics || ''}
                                onChange={(e) => setSpecifications(prev => ({ ...prev, electronics: e.target.value }))}
                                placeholder="e.g. ESP32-S3, OLED Display"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Power</label>
                              <input
                                type="text"
                                value={specifications.power || ''}
                                onChange={(e) => setSpecifications(prev => ({ ...prev, power: e.target.value }))}
                                placeholder="e.g. USB-C 5V / 2A"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Connectivity</label>
                              <input
                                type="text"
                                value={specifications.connectivity || ''}
                                onChange={(e) => setSpecifications(prev => ({ ...prev, connectivity: e.target.value }))}
                                placeholder="e.g. Wi-Fi 2.4GHz, Bluetooth 5.2"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Dimensions</label>
                              <input
                                type="text"
                                value={specifications.dimensions || ''}
                                onChange={(e) => setSpecifications(prev => ({ ...prev, dimensions: e.target.value }))}
                                placeholder="e.g. 100 x 50 x 20 mm"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              {/* AWS S3 Product Media Upload Section */}
              <div className="space-y-4">
                {/* Unified Media Upload Zone */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Product Media (Images & Videos - Max 5MB per file)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-zinc-50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-zinc-400" />
                      <VideoIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700">Click to upload images or videos</span>
                    <span className="text-[10px] text-zinc-400">Supports PNG, JPG, JPEG, MP4, WebM (Max 5MB per file)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Previews grid for Images */}
                {(existingMedia.filter(m => (m.mediaType || 'image') === 'image').length > 0 || imagePreviews.length > 0) && (
                  <div className="space-y-2 border border-zinc-150 rounded-2xl p-4 bg-zinc-50/50">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Select Primary Cover Image:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Existing Uploaded Images */}
                      {existingMedia.filter(m => (m.mediaType || 'image') === 'image').map((img, index) => (
                        <div key={img.id} className="relative group rounded-xl border border-zinc-200 overflow-hidden bg-white aspect-square">
                          <img src={img.imageUrl} alt="preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingMedia(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-650 hover:bg-red-500 text-white rounded-lg transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <label className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-1 flex items-center justify-between text-[10px] text-white cursor-pointer hover:bg-black/85 transition">
                            <span className="truncate">Primary Cover</span>
                            <input
                              type="radio"
                              name="primary-image"
                              checked={primaryIndex === index}
                              onChange={() => setPrimaryIndex(index)}
                              className="accent-violet-500 h-3 w-3 cursor-pointer"
                            />
                          </label>
                        </div>
                      ))}

                      {/* New Upload Previews */}
                      {imagePreviews.map((url, index) => {
                        const actualIdx = existingMedia.filter(m => (m.mediaType || 'image') === 'image').length + index;
                        return (
                          <div key={index} className="relative group rounded-xl border border-zinc-200 overflow-hidden bg-white aspect-square">
                            <img src={url} alt="preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-650 hover:bg-red-500 text-white rounded-lg transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <label className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-1 flex items-center justify-between text-[10px] text-white cursor-pointer hover:bg-black/85 transition">
                              <span className="truncate">Primary Cover</span>
                              <input
                                type="radio"
                                name="primary-image"
                                checked={primaryIndex === actualIdx}
                                onChange={() => setPrimaryIndex(actualIdx)}
                                className="accent-violet-500 h-3 w-3 cursor-pointer"
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Previews grid for Videos */}
                {(existingMedia.filter(m => m.mediaType === 'video').length > 0 || videoPreviews.length > 0) && (
                  <div className="space-y-2 border border-zinc-150 rounded-2xl p-4 bg-zinc-50/50">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Uploaded Videos Preview:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Existing Videos */}
                      {existingMedia.filter(m => m.mediaType === 'video').map((vid) => (
                        <div key={vid.id} className="relative rounded-xl border border-zinc-200 overflow-hidden bg-white p-1">
                          <video src={vid.imageUrl} controls className="w-full rounded-lg h-36 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingMedia(vid.id)}
                            className="absolute top-3 right-3 p-1 bg-red-650 hover:bg-red-500 text-white rounded-lg transition-colors shadow-md z-10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* New Videos */}
                      {videoPreviews.map((url, index) => (
                        <div key={index} className="relative rounded-xl border border-zinc-200 overflow-hidden bg-white p-1">
                          <video src={url} controls className="w-full rounded-lg h-36 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSelectedVideo(index)}
                            className="absolute top-3 right-3 p-1 bg-red-650 hover:bg-red-500 text-white rounded-lg transition-colors shadow-md z-10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-violet-500 transition flex items-center gap-1.5 disabled:opacity-65"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                      Uploading Media to S3...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create Product' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-650" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 mb-2">Delete Catalog Product</h3>
            <p className="text-xs text-zinc-500 mb-6 px-2">
              Are you sure you want to delete the product <span className="font-bold text-zinc-800">"{productToDelete.name}"</span>? This will permanently delete its records and all associated images stored in S3.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                disabled={deletingId !== null}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-500 transition flex items-center gap-1.5 disabled:opacity-65"
              >
                {deletingId !== null ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Palette Chart Modal Overlay */}
      {isColorChartOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsColorChartOpen(false)}>
          <div className="relative max-w-lg w-full bg-white dark:bg-[#12131a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Filament &amp; Material Color Chart</h3>
                <p className="text-xs text-zinc-500">Click any color swatch to add to product color options.</p>
              </div>
              <button
                onClick={() => setIsColorChartOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
              {PRESET_COLOR_CHART.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    if (activeColorIndex !== null) {
                      setColorOptions(prev => prev.map((item, idx) => idx === activeColorIndex ? { name: c.name, code: c.code, priceAdjustment: c.priceAdjustment || 0 } : item));
                    } else {
                      setColorOptions(prev => [...prev, { name: c.name, code: c.code, priceAdjustment: c.priceAdjustment || 0 }]);
                    }
                    showToast(`Added ${c.name} (+₹${c.priceAdjustment || 0}) to product colors!`);
                    setIsColorChartOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900 hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-sm transition-all text-left group"
                >
                  <span
                    className="h-7 w-7 rounded-lg border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: c.code }}
                  />
                  <div className="overflow-hidden">
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block truncate">{c.name}</span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block">{c.code}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsColorChartOpen(false)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition"
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global custom premium toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
