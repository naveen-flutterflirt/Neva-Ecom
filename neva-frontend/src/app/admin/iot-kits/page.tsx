'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { Boxes, Plus, Edit, Trash2, Search } from 'lucide-react';
import Toast from '../../../components/ui/Toast';

export default function IotKitsAdminPage() {
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const response = await apiClient('/iot-kits');
      if (response.success) {
        setKits(response.data);
      }
    } catch (error: any) {
      console.error(error);
      setToastMessage(error.message || 'Failed to fetch IoT Kits');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this IoT Kit? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await apiClient(`/iot-kits/${id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        showToast('IoT Kit deleted successfully');
        setKits(kits.filter(kit => kit.id !== id));
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to delete IoT Kit');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">IoT Kits</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your IoT kits and hardware packages</p>
        </div>
        <Link
          href="/admin/iot-kits/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md shadow-violet-600/20 transition-all active:scale-95 text-sm whitespace-nowrap"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Kit
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search kits..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
          <div className="text-sm font-medium text-zinc-500">
            Total {kits.length} Kits
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : kits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="h-16 w-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
                <Boxes className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">No IoT Kits Found</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                You haven't created any IoT kits yet. Click the button above to add your first kit.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200">
                  <th className="py-3 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Product Info</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {kits.map((kit) => (
                  <tr key={kit.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                          {kit.images && kit.images[0] ? (
                            <img src={kit.images[0].imageUrl} alt={kit.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-400">
                              <Boxes className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-zinc-900 line-clamp-1">{kit.name}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{kit.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-zinc-900">₹{kit.price}</div>
                      {kit.discountPrice && (
                        <div className="text-xs text-zinc-400 line-through">₹{kit.discountPrice}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${kit.stock > 10 ? 'bg-emerald-50 text-emerald-700' : kit.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {kit.stock} in stock
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${kit.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
                        {kit.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/iot-kits/edit/${kit.id}`} className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors inline-block">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(kit.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
