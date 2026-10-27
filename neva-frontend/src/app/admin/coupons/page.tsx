'use client';

import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sparkles,
  Tag,
  Calendar,
  Users,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../../lib/api';

interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number | string;
  maxDiscountAmount?: number | string | null;
  minOrderAmount: number | string;
  applicableUser: 'all' | 'new_customer';
  usageLimitTotal?: number | null;
  usageLimitPerUser: number;
  usedCount: number;
  showInPublicList: boolean;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '0',
    applicableUser: 'all' as 'all' | 'new_customer',
    usageLimitTotal: '',
    usageLimitPerUser: '1',
    showInPublicList: true,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/coupons');
      if (res && res.data) {
        setCoupons(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
      showToast('❌ Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormError('');
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscountAmount: '',
      minOrderAmount: '0',
      applicableUser: 'all',
      usageLimitTotal: '',
      usageLimitPerUser: '1',
      showInPublicList: true,
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: CouponItem) => {
    setIsEditing(true);
    setCurrentId(coupon.id);
    setFormError('');
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      minOrderAmount: String(coupon.minOrderAmount || 0),
      applicableUser: coupon.applicableUser,
      usageLimitTotal: coupon.usageLimitTotal ? String(coupon.usageLimitTotal) : '',
      usageLimitPerUser: String(coupon.usageLimitPerUser || 1),
      showInPublicList: coupon.showInPublicList,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : '',
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setFormError('Please enter a valid discount value');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        usageLimitTotal: formData.usageLimitTotal ? Number(formData.usageLimitTotal) : null,
        usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
        startDate: formData.startDate ? formData.startDate : null,
        endDate: formData.endDate ? formData.endDate : null,
      };

      if (isEditing && currentId) {
        await apiClient(`/coupons/${currentId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast(`✓ Coupon "${payload.code}" updated successfully!`);
      } else {
        await apiClient('/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast(`✓ Coupon "${payload.code}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await apiClient(`/coupons/${id}`, { method: 'DELETE' });
      showToast(`Deleted coupon "${code}"`);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      showToast('❌ Failed to delete coupon');
    }
  };

  const toggleStatus = async (coupon: CouponItem) => {
    try {
      const updated = !coupon.isActive;
      await apiClient(`/coupons/${coupon.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: updated }),
      });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: updated } : c));
      showToast(`Coupon "${coupon.code}" is now ${updated ? 'Active' : 'Inactive'}`);
    } catch (err) {
      showToast('❌ Failed to update status');
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return c.code.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-xl border border-zinc-800 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-wider mb-1">
            <TicketPercent className="h-4 w-4" />
            Marketing & Discounts
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Coupons & Promo Codes</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Create discount offers, set min-cart value (e.g. ₹2000), percentage/flat discounts, or first-order perks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search code or offer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-violet-500 text-zinc-900 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="font-bold text-zinc-800">{coupons.length} Total Coupons</span>
          <span>•</span>
          <span className="text-emerald-600 font-bold">
            {coupons.filter(c => c.isActive).length} Active
          </span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-extrabold uppercase tracking-wider text-[11px] text-zinc-500">
              <tr>
                <th className="px-5 py-3.5">Promo Code</th>
                <th className="px-4 py-3.5">Discount</th>
                <th className="px-4 py-3.5">Min Order</th>
                <th className="px-4 py-3.5">Audience</th>
                <th className="px-4 py-3.5">Public List</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-zinc-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-400">
                    <Tag className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                    No coupons found. Click &quot;Create Coupon&quot; to add your first promotion.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Code & Description */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-zinc-950 bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg">
                          {c.code}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs line-clamp-1">{c.description}</p>
                      )}
                    </td>

                    {/* Discount Value */}
                    <td className="px-4 py-4 font-bold text-zinc-900">
                      {c.discountType === 'percentage' ? (
                        <div>
                          <span className="text-violet-600 font-extrabold text-sm">{c.discountValue}% OFF</span>
                          {c.maxDiscountAmount && (
                            <span className="block text-[10px] text-zinc-400 font-normal">
                              Up to ₹{Number(c.maxDiscountAmount).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-extrabold text-sm">
                          ₹{Number(c.discountValue).toLocaleString('en-IN')} FLAT
                        </span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="px-4 py-4 font-mono font-medium text-zinc-700">
                      {Number(c.minOrderAmount) > 0 ? (
                        <span>₹{Number(c.minOrderAmount).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-zinc-400">No Minimum</span>
                      )}
                    </td>

                    {/* Target Audience */}
                    <td className="px-4 py-4">
                      {c.applicableUser === 'new_customer' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="h-2.5 w-2.5" />
                          New Customers Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-650">
                          <Users className="h-2.5 w-2.5" />
                          All Customers
                        </span>
                      )}
                    </td>

                    {/* Public Visibility */}
                    <td className="px-4 py-4">
                      {c.showInPublicList ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <Eye className="h-3 w-3" /> Visible in Cart
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                          <EyeOff className="h-3 w-3" /> Secret Code
                        </span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border transition ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          title="Edit Coupon"
                          className="p-1.5 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          title="Delete Coupon"
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                  <TicketPercent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-950">
                    {isEditing ? 'Edit Promo Code' : 'Create New Promo Code'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Configure discount rules and eligibility</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code & Discount Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OFFER50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 outline-none focus:border-violet-600 bg-zinc-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e: any) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-600 bg-zinc-50 focus:bg-white cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Discount Value & Max Discount Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    {formData.discountType === 'percentage' ? 'Discount (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : '99999'}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 50' : 'e.g. 200'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    disabled={formData.discountType === 'flat'}
                    placeholder="e.g. 500 (optional)"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-600 disabled:bg-zinc-100 disabled:text-zinc-400"
                  />
                </div>
              </div>

              {/* Min Order & Target Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Min Purchase Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-600"
                  />
                  <span className="text-[10px] text-zinc-400">Cart subtotal required to apply</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Customer Eligibility
                  </label>
                  <select
                    value={formData.applicableUser}
                    onChange={(e: any) => setFormData({ ...formData, applicableUser: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-600 bg-zinc-50 focus:bg-white cursor-pointer"
                  >
                    <option value="all">All Customers</option>
                    <option value="new_customer">New Customers (1st Order Only)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                  Offer Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% OFF on purchase above ₹2000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs text-zinc-900 outline-none focus:border-violet-600"
                />
              </div>

              {/* Switches: Show in Public List & Active */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50">
                  <input
                    type="checkbox"
                    checked={formData.showInPublicList}
                    onChange={(e) => setFormData({ ...formData, showInPublicList: e.target.checked })}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                  <span>Show to Customer in Cart / Checkout list</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                  <span>Coupon is Active</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
