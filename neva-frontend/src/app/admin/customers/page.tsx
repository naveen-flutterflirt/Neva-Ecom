'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Trash2,
  X,
  User,
  Calendar,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Loader2,
  Package,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { TableSkeletonRows } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../lib/api';
import Pagination from '../../../components/ui/Pagination';

interface CustomerOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: CustomerOrderItem[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  orders: CustomerOrder[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchLiveCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/auth/customers');
      if (res.success && Array.isArray(res.data)) {
        const mapped: Customer[] = res.data.map((c: any) => {
          const userOrders: CustomerOrder[] = Array.isArray(c.orders)
            ? c.orders.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber || o.id,
                totalAmount: Number(o.totalAmount || 0),
                orderStatus: o.orderStatus || 'pending',
                paymentStatus: o.paymentStatus || 'pending',
                createdAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                items: Array.isArray(o.items)
                  ? o.items.map((it: any) => ({
                      id: it.id,
                      productId: it.productId,
                      productName: it.productName || 'Product',
                      productImage: it.productImage || '',
                      quantity: Number(it.quantity || 1),
                      unitPrice: Number(it.unitPrice || 0),
                      totalPrice: Number(it.totalPrice || 0),
                    }))
                  : [],
              }))
            : [];

          const lastShippingAddr = userOrders.length > 0 && userOrders[0] 
            ? (c.orders[0].shippingAddress || 'No address saved') 
            : 'No address saved';

          return {
            id: c.id,
            name: c.name || 'Customer',
            email: c.email || 'N/A',
            phone: c.phone || c.whatsappNumber || 'N/A',
            shippingAddress: lastShippingAddr,
            joinDate: new Date(c.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            totalOrders: c.totalOrders || userOrders.length,
            totalSpent: Number(c.totalSpent || 0),
            status: 'active',
            orders: userOrders,
          };
        });

        setCustomers(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch customers API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCustomers();
  }, []);

  // Toggle user status active/blocked
  const handleStatusChange = (id: string, newStatus: Customer['status']) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
    showToast(`Customer account status updated successfully! ⚡`);
  };

  // Delete customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selectedCustomer?.id === id) {
        setIsDetailOpen(false);
        setSelectedCustomer(null);
      }
      showToast(`✓ Customer "${name}" deleted successfully! 🗑️`);
    }
  };

  // Filter list & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
          <User className="h-7 w-7 text-violet-650" />
          Customers Directory & Order History
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Monitor active database user profiles, view purchased products & order transaction details.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10">
        <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, phone or Customer ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} listed
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                <th className="pl-6 pr-2 py-3 w-10">No</th>
                <th className="pl-2 pr-6 py-3">Customer ID</th>
                <th className="px-6 py-3">Profile Info</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3 text-center">Orders Placed</th>
                <th className="px-6 py-3 text-center">Total Value</th>
                <th className="px-6 py-3 text-center">Account Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {isLoading ? (
                <TableSkeletonRows rows={6} cols={8} />
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-400 text-sm">
                    No customers found matching your search parameters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, index) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="pl-6 pr-2 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="pl-2 pr-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-violet-700 text-xs bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap font-mono">{c.id.substring(0, 12)}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-violet-50 border border-violet-200 text-violet-750 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 text-xs">{c.name}</span>
                          <span className="text-[10px] text-zinc-450 mt-0.5">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono">
                      <span className="text-zinc-650 text-xs font-semibold">{c.phone}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="text-zinc-900 font-bold text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">{c.totalOrders} orders</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="text-zinc-900 font-bold text-xs font-mono">₹{c.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-full px-3 py-1 border cursor-pointer outline-none text-center bg-white ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-red-50 text-red-750 border-red-200'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs px-2.5 cursor-pointer"
                          title="View Details & Purchased Orders"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Orders
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs px-2 cursor-pointer"
                          title="Delete Customer"
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

        {/* Table Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Customer Details & Purchased Orders Modal */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <User className="h-5 w-5 text-violet-650" />
                Customer Profile &amp; Purchased Orders
              </h3>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 pb-2 scrollbar-thin">
              {/* Account Meta Card */}
              <div className="flex items-center justify-between bg-zinc-50 border border-zinc-150 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-extrabold flex items-center justify-center text-sm uppercase">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 truncate">{selectedCustomer.name}</h4>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Spent</span>
                  <span className="text-base font-mono font-extrabold text-purple-600">₹{selectedCustomer.totalSpent.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone / WhatsApp</span>
                  <div className="flex items-center gap-2 text-zinc-800 font-semibold font-mono">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                </div>
                <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Member Since</span>
                  <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{selectedCustomer.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Purchased Orders & Products Breakdown Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-purple-600" />
                    Placed Orders History ({selectedCustomer.orders.length})
                  </span>
                  <span className="text-purple-600 font-mono font-bold text-xs">{selectedCustomer.totalOrders} Orders Total</span>
                </h4>

                {selectedCustomer.orders.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 border border-zinc-150 rounded-xl space-y-2">
                    <Package className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="text-xs font-bold text-zinc-500">No orders placed by this customer yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((ord) => (
                      <div key={ord.id} className="border border-zinc-200 rounded-2xl p-4 space-y-3 bg-zinc-50/50 hover:bg-zinc-50 transition">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-semibold">{ord.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.paymentStatus}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-zinc-900">₹{ord.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Products List for this order */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Products Purchased ({ord.items.length}):</span>
                          <div className="divide-y divide-zinc-200/60 bg-white rounded-xl border border-zinc-200/80 p-2 space-y-1">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 pt-1 pb-1 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {item.productImage ? (
                                    <img src={item.productImage} alt={item.productName} className="h-8 w-8 rounded-lg object-contain bg-zinc-50 border border-zinc-200 shrink-0" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                      <Package className="h-4 w-4" />
                                    </div>
                                  )}
                                  <span className="font-bold text-zinc-900 truncate">{item.productName}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-zinc-500 font-mono text-[11px]">Qty: <strong className="text-zinc-900 font-bold">{item.quantity}</strong></span>
                                  <span className="font-mono font-bold text-zinc-900 ml-3">₹{item.totalPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Close Audit
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
