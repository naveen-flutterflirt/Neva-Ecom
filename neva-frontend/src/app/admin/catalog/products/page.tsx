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
  Video as VideoIcon
} from 'lucide-react';
import Toast from '../../../../components/ui/Toast';

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
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
const PRODUCTS_API = `${API_BASE}/products`;
const CATEGORIES_API = `${API_BASE}/categories`;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const [autoSku, setAutoSku] = useState(true);

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
    setStatus('draft');
    setAutoSku(true);
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setSelectedVideoFiles([]);
    setVideoPreviews([]);
    setExistingMedia([]);
    setDeletedImageIds([]);
    setPrimaryIndex(0);
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
    setAutoSku(false);
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setSelectedVideoFiles([]);
    setVideoPreviews([]);
    setExistingMedia(product.images || []);
    setDeletedImageIds([]);
    
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
    formData.append('primaryImageIndex', primaryIndex.toString());

    // Append images
    selectedImageFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append videos
    selectedVideoFiles.forEach((file) => {
      formData.append('videos', file);
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

  // Filters
  const filteredProducts = products.filter((prod) => {
    const query = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.sku.toLowerCase().includes(query) ||
      (prod.description && prod.description.toLowerCase().includes(query))
    );
  });

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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-400">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const primaryImg = (product.images || []).find(img => img.isPrimary && (img.mediaType || 'image') === 'image') || (product.images || []).find(img => (img.mediaType || 'image') === 'image');
                    return (
                      <tr 
                        key={product.id}
                        className={`hover:bg-zinc-50 transition-colors duration-150 ${
                          deletingId === product.id ? 'opacity-40 pointer-events-none bg-red-50' : ''
                        }`}
                      >
                        <td className="px-6 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold">{index + 1}</td>
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
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                            product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            product.status === 'out_of_stock' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              product.status === 'active' ? 'bg-emerald-500' :
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
        </div>
      )}

      {/* Save Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              
  {/* Material Variants */}
  <div className="space-y-2">
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
      Material Variants
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">Tough PLA (base price)</span>
        <span className="text-xs font-semibold text-zinc-500">0</span>
      </div>
      <div className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">PETG</span>
        <span className="text-xs font-semibold text-zinc-500">+150</span>
      </div>
      <div className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">ABS</span>
        <span className="text-xs font-semibold text-zinc-500">+200</span>
      </div>
      <button className="text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors flex items-center gap-1">
        <Plus className="h-3 w-3" />
        Add Material
      </button>
    </div>
  </div>

  {/* Chipset / Processor */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Chipset / Processor
    </label>
    <input
      type="text"
      placeholder="e.g. ESP32-S3"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Sensors */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Sensors
    </label>
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-700">Temperature</span>
      <button className="text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors flex items-center gap-1">
        <Plus className="h-3 w-3" />
        Add sensor...
      </button>
    </div>
  </div>

  {/* Display */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Display
    </label>
    <input
      type="text"
      placeholder="e.g. 1.54 inch OLED"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Power Source */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Power Source
    </label>
    <input
      type="text"
      placeholder="USB-C"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Voltage / Current */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Voltage / Current
    </label>
    <input
      type="text"
      placeholder="e.g. 5V / 2A"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Connectivity Type */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Connectivity Type
    </label>
    <div className="flex flex-wrap gap-2">
      {['Wi-Fi', 'Bluetooth', 'Zigbee', 'Z-Wave', 'LoRa'].map((type) => (
        <button
          key={type}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-violet-400 hover:bg-violet-50 transition-colors"
        >
          {type}
        </button>
      ))}
    </div>
  </div>

  {/* Wi-Fi Band */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Wi-Fi Band
    </label>
    <input
      type="text"
      placeholder="Dual-band"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Bluetooth Version */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Bluetooth Version
    </label>
    <input
      type="text"
      placeholder="5.2 LE"
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
    />
  </div>

  {/* Dimensions */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Dimensions
    </label>
    <div className="grid grid-cols-3 gap-2">
      <div>
        <input
          type="text"
          placeholder="Length"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Width"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Height"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white"
        />
      </div>
    </div>
    <span className="text-[10px] text-zinc-400 mt-1 block">mm</span>
  </div>

  {/* Key Features */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Key Features
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">Seamless App Control</span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">Ultra-long Battery Life</span>
      </div>
      <button className="text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors flex items-center gap-1">
        <Plus className="h-3 w-3" />
        Add Feature
      </button>
    </div>
  </div>

  {/* Care Instructions */}
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
      Care Instructions
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <span className="text-xs text-zinc-700">- Wipe clean with a dry cloth.</span>
      </div>
      <button className="text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors flex items-center gap-1">
        <Plus className="h-3 w-3" />
        Add instruction...
      </button>
    </div>
  </div>

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

      {/* Global custom premium toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
