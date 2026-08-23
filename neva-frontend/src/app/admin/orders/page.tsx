'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  X,
  AlertTriangle,
  ShoppingBag,
  Download,
  Calendar,
  CreditCard,
  User,
  Loader2
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { TableSkeletonRows } from '../../../components/ui/Skeleton';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: 'pending_payment' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const INITIAL_MOCK_ORDERS: Order[] = [];

import { apiClient } from '../../../lib/api';

import Pagination from '../../../components/ui/Pagination';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Detail Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Confirmation States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const fetchLiveOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/orders');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mappedOrders: Order[] = res.data.map((o: any) => ({
          id: o.orderNumber || o.id,
          customerName: o.customerName || 'Customer',
          customerEmail: o.customerEmail || 'n/a',
          shippingAddress: o.shippingAddress || 'n/a',
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                name: it.productName || 'Product',
                price: Number(it.unitPrice || 0),
                quantity: Number(it.quantity || 1),
              }))
            : [],
          totalAmount: Number(o.totalAmount || 0),
          paymentStatus: o.paymentStatus || 'pending',
          status: o.orderStatus === 'pending' ? 'confirmed' : o.orderStatus,
          createdAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn('Failed to fetch live orders (using mock orders):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Get status count helper
  const getCount = (statusType: string) => {
    if (statusType === 'all') return orders.length;
    return orders.filter(o => o.status === statusType).length;
  };

  // Handle order status transition
  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        return { ...order, status: newStatus };
      }
      return order;
    }));

    try {
      await apiClient(`/orders/${id}/status`, {
        method: 'PUT',
        body: { orderStatus: newStatus }
      });
      showToast(`Order status updated to "${newStatus}" in database! ⚡`);
    } catch (err: any) {
      console.error('Failed to sync status with database:', err);
      showToast(`Order status updated locally! ⚡`);
    }
  };

  // Delete order handler
  const handleDeleteConfirm = () => {
    if (!orderToDelete) return;
    setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
    showToast(`Order ${orderToDelete.id} removed successfully! 🗑️`);
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  // Items listing string formatter
  const getItemsSummary = (items: OrderItem[]) => {
    if (items.length === 0) return 'No items';
    const mainItem = items[0];
    const restCount = items.length - 1;
    return `${mainItem.name} (x${mainItem.quantity})${restCount > 0 ? ` +${restCount} more` : ''}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-violet-650" />
          Orders Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Track shipment lifecycles, manage payments, and invoice details.</p>
      </div>

      {/* Dynamic Pill Tabs Rail - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-none">
        <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/80 w-max">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending_payment', label: 'Pending Payment' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'in_production', label: 'In Production' },
            { id: 'ready_to_ship', label: 'Ready to Ship' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => {
            const count = getCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' 
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/40 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-violet-650 text-white shadow-sm shadow-violet-500/10' 
                    : 'bg-zinc-200 text-zinc-550'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10">
        <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by customer name or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Orders Table - scrollbar-none & decreased spacing */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                <th className="pl-6 pr-2 py-3 w-10">No</th>
                <th className="pl-2 pr-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Products Purchased</th>
                <th className="px-6 py-3 text-center">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {isLoading ? (
                <TableSkeletonRows rows={6} cols={7} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-400 text-sm">
                    No orders found in this status category.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="pl-6 pr-2 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="pl-2 pr-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-violet-700 text-xs bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap">{order.id}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 text-xs">{order.customerName}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-zinc-700 text-xs font-semibold max-w-[240px] block truncate">
                        {getItemsSummary(order.items)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-zinc-900 text-xs">₹{order.totalAmount}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                          order.paymentStatus === 'paid' ? 'text-emerald-600 bg-emerald-50' :
                          order.paymentStatus === 'failed' ? 'text-red-600 bg-red-50' :
                          'text-amber-600 bg-amber-50'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-full px-3 py-1 border cursor-pointer outline-none text-center bg-white ${
                          order.status === 'pending_payment' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'in_production' ? 'bg-violet-50 text-violet-750 border-violet-200' :
                          order.status === 'ready_to_ship' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                          order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-zinc-100 text-zinc-500 border-zinc-200'
                        }`}
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_production">In Production</option>
                        <option value="ready_to_ship">Ready to Ship</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled / Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-150 rounded-lg transition-colors"
                          title="Delete Order"
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
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Order Details & Billing Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-violet-650" />
                Order Invoice Details - {selectedOrder.id}
              </h3>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 pb-2 scrollbar-thin">
              {/* Customer and Shipping Information */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 space-y-3">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block border-b border-zinc-150 pb-1">Delivery Address</span>
                <div className="text-xs font-semibold text-zinc-800 space-y-1">
                  <div className="flex items-center gap-1 text-zinc-900">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{selectedOrder.customerName} ({selectedOrder.customerEmail})</span>
                  </div>
                  <p className="text-zinc-650 mt-1 leading-relaxed pl-4.5 font-medium">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Order Meta details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Order Date</span>
                    <span className="font-bold text-zinc-800">{selectedOrder.createdAt}</span>
                  </div>
                </div>
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Payment Status</span>
                    <span className="font-bold text-zinc-800 capitalize">{selectedOrder.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200">
                  Ordered Items
                </div>
                <div className="divide-y divide-zinc-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="px-3 py-2.5 flex items-center justify-between text-xs font-semibold">
                      <div className="flex flex-col min-w-0">
                        <span className="text-zinc-900 truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-450 mt-0.5">₹{item.price} per unit</span>
                      </div>
                      <span className="text-zinc-550 shrink-0 font-bold ml-4">
                        x{item.quantity} = ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-50/50 px-3 py-3 border-t border-zinc-200 flex justify-between items-center text-xs font-bold text-zinc-900">
                  <span>Grand Total</span>
                  <span className="text-violet-700 text-sm">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => showToast('Mock PDF Invoice downloaded! 📄')}
                className="inline-flex items-center gap-1 bg-violet-650 hover:bg-violet-600 text-white rounded-xl px-3 py-2 text-xs font-semibold transition mr-auto"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-650" />
            </div>
            
            <h3 className="text-base font-bold text-zinc-900 mb-2">Delete Order Record</h3>
            <p className="text-xs text-zinc-500 mb-6 px-2">
              Are you sure you want to delete order ticket <span className="font-bold text-zinc-800">"{orderToDelete.id}"</span>? This will permanently wipe the record.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setOrderToDelete(null);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-500 transition"
              >
                Yes, Delete
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
