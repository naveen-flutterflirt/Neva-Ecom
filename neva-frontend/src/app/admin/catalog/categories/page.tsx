'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Toast from '../../../../components/ui/Toast';
import { API_URL } from '../../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive';
}

const BACKEND_URL = `${API_URL}/categories`;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UX Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form Input States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [autoSlug, setAutoSlug] = useState(true);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BACKEND_URL);
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (err: any) {
      console.warn('Backend connection failed, falling back to empty category state. Error:', err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync slug input when Name changes if auto-slug is enabled
  useEffect(() => {
    if (autoSlug && modalMode === 'create') {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  }, [name, autoSlug, modalMode]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCategoryId(null);
    setName('');
    setSlug('');
    setDescription('');
    setStatus('active');
    setAutoSlug(true);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setSelectedCategoryId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setStatus(category.status);
    setAutoSlug(false);
    setIsModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name,
      slug,
      description: description || null,
      status
    };

    try {
      let response;
      if (modalMode === 'create') {
        response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${BACKEND_URL}/${selectedCategoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response && response.ok) {
        await fetchCategories();
        showToast(modalMode === 'create' ? 'Category created successfully! 🎉' : 'Category updated successfully! ⚡');
        setIsModalOpen(false);
      } else {
        throw new Error('API Sync Failed');
      }
    } catch (err) {
      // Local state fallback
      if (modalMode === 'create') {
        const newCategory: Category = {
          id: Math.random().toString(36).substr(2, 9),
          ...payload
        };
        setCategories(prev => [newCategory, ...prev]);
        showToast('Category created locally! 🎉');
      } else {
        setCategories(prev => prev.map(c => {
          if (c.id === selectedCategoryId) {
            return {
              ...c,
              ...payload
            };
          }
          return c;
        }));
        showToast('Category updated locally! ⚡');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete.id;
    setDeletingId(id);

    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchCategories();
        showToast('Category deleted successfully! 🗑️');
      } else {
        throw new Error('Delete API Failed');
      }
    } catch (err) {
      // Local state fallback
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category deleted locally! 🗑️');
    } finally {
      setDeletingId(null);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Filtering list
  const filteredCategories = categories.filter(category => {
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage catalog categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10">
        <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Main Content Area */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          {/* Table header row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <p className="text-sm font-semibold text-zinc-700">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
            </p>
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-3 w-14">No</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      No categories found. Click "Add Category" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <tr
                      key={category.id}
                      className={`hover:bg-zinc-50 transition-colors duration-150 ${deletingId === category.id ? 'opacity-40 pointer-events-none bg-red-50' : ''
                        }`}
                    >
                      <td className="px-6 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold">{index + 1}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-zinc-900 text-xs">{category.name}</span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-500 font-mono text-[11px]">{category.slug}</td>
                      <td className="px-6 py-3.5 text-zinc-500 text-[11px] max-w-[200px]">
                        <span className="block truncate">{category.description || '—'}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${category.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${category.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(category)}
                            disabled={deletingId !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 transition-colors disabled:opacity-30"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            disabled={deletingId !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-30"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900">
                {modalMode === 'create' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition disabled:opacity-30"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 pb-2">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PLA Filament"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Category Slug
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-zinc-500 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isSaving}
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded border-zinc-350 text-violet-600 focus:ring-violet-400 h-3 w-3 disabled:opacity-60"
                    />
                    Auto-generate
                  </label>
                </div>
                <input
                  type="text"
                  required
                  disabled={autoSlug || isSaving}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. pla-filament"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  disabled={isSaving}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description details..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white resize-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  disabled={isSaving}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

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
                      Saving...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create Category' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 mb-2">Delete Category</h3>
            <p className="text-xs text-zinc-500 mb-6 px-2">
              Are you sure you want to delete the category <span className="font-bold text-zinc-800">"{categoryToDelete.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
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