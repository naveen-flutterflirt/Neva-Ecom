'use client';

import { 
  Search, 
  Eye, 
  X,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { TableSkeletonRows } from '../../../components/ui/Skeleton';
import Pagination from '../../../components/ui/Pagination';

interface Transaction {
  id: string;
  orderId: string;
  razorpayOrderId?: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  amount: number;
  status: 'successful' | 'failed' | 'refunded';
  gatewayRef: string;
  createdAt: string;
}

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [];

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Detail Modal States
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchLivePayments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/orders');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mappedTxns: Transaction[] = res.data.map((o: any, idx: number) => {
          let txStatus: 'successful' | 'failed' | 'refunded' = 'successful';
          if (o.paymentStatus === 'failed') txStatus = 'failed';
          else if (o.paymentStatus === 'refunded') txStatus = 'refunded';
          else if (o.paymentStatus === 'paid' || o.paymentStatus === 'Paid via Razorpay' || o.paymentMethod === 'cod') txStatus = 'successful';

          return {
            id: o.razorpayPaymentId || `TXN-${1000 + idx}`,
            orderId: o.orderNumber || o.id,
            razorpayOrderId: o.razorpayOrderId || undefined,
            customerName: o.customerName || 'Customer',
            customerEmail: o.customerEmail || 'n/a',
            paymentMethod: (o.paymentMethod || 'UPI').toUpperCase(),
            amount: Number(o.totalAmount || 0),
            status: txStatus,
            gatewayRef: o.razorpayPaymentId || o.razorpayOrderId || o.orderNumber || `pay_${Date.now()}`,
            createdAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          };
        });

        setTransactions(mappedTxns);
      }
    } catch (err) {
      console.warn('Failed to fetch live payments (using mock fallback):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePayments();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Get status count helper
  const getCount = (statusType: string) => {
    if (statusType === 'all') return transactions.length;
    if (statusType === 'refunds') return transactions.filter(t => t.status === 'refunded').length;
    return transactions.filter(t => t.status === statusType).length;
  };

  // Handle status update
  const handleStatusChange = (id: string, newStatus: Transaction['status']) => {
    setTransactions(prev => prev.map(txn => {
      if (txn.id === id) {
        return { ...txn, status: newStatus };
      }
      return txn;
    }));
    showToast(`Payment status updated successfully! ⚡`);
  };

  // Filter transactions
  // Search, Filters & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'refunds') return matchesSearch && txn.status === 'refunded';
    return matchesSearch && txn.status === activeTab;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-violet-650" />
          Payments & Transactions
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Review payment gateway logs, track successful payments, and process refunds.</p>
      </div>

      {/* Dynamic Pill Tabs Rail - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-none">
        <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/80 w-max">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'successful', label: 'Successful' },
            { id: 'failed', label: 'Failed' },
            { id: 'refunds', label: 'Refunds' }
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
          placeholder="Search by customer, Txn ID, or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Payments Table - scrollbar-none & decreased spacing */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                <th className="pl-6 pr-2 py-3 w-10">No</th>
                <th className="pl-2 pr-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3 text-center">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {isLoading ? (
                <TableSkeletonRows rows={6} cols={8} />
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-400 text-sm">
                    No transactions found in this status category.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn, index) => (
                  <tr key={txn.id} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="pl-6 pr-2 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="pl-2 pr-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-violet-700 text-xs bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap">{txn.id}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80 w-fit">
                          {txn.orderId}
                        </span>
                        {txn.razorpayOrderId && (
                          <span className="font-mono text-[9px] text-zinc-400">
                            {txn.razorpayOrderId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 text-xs">{txn.customerName}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{txn.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-zinc-650 text-xs font-semibold">{txn.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="font-bold text-zinc-900 text-xs">₹{txn.amount}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={txn.status}
                        onChange={(e) => handleStatusChange(txn.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-full px-3 py-1 border cursor-pointer outline-none text-center bg-white ${
                          txn.status === 'successful' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          txn.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-705 border-amber-200'
                        }`}
                      >
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => {
                            setSelectedTxn(txn);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
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
          totalItems={filteredTransactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Transaction Details Modal */}
      {isDetailOpen && selectedTxn && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-violet-650" />
                Gateway Audit Log - {selectedTxn.id}
              </h3>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 pb-2 scrollbar-thin">
              {/* Customer Contact */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block mb-1">Customer Info</span>
                <div className="text-xs font-semibold text-zinc-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Name:</span>
                    <span>{selectedTxn.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Email:</span>
                    <span>{selectedTxn.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Gateway References */}
              <div className="border border-zinc-200 rounded-xl p-3 space-y-3">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block border-b border-zinc-150 pb-1">Payment Gateway Details</span>
                <div className="text-xs font-semibold text-zinc-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Order Reference:</span>
                    <span className="font-mono text-zinc-900">{selectedTxn.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Gateway Reference ID:</span>
                    <span className="font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">{selectedTxn.gatewayRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Payment Method:</span>
                    <span>{selectedTxn.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Timestamp</span>
                    <span className="font-bold text-zinc-800">{selectedTxn.createdAt}</span>
                  </div>
                </div>
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Settled Amount</span>
                    <span className="font-bold text-zinc-850">₹{selectedTxn.amount}</span>
                  </div>
                </div>
              </div>

              {/* Audit status detail */}
              <div className="border border-zinc-150 rounded-xl p-3 flex items-center justify-between bg-zinc-50/50">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Status Check</span>
                  <span className={`text-xs font-bold capitalize ${
                    selectedTxn.status === 'successful' ? 'text-emerald-700' :
                    selectedTxn.status === 'failed' ? 'text-red-650' :
                    'text-amber-600'
                  }`}>
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Audited & Secure
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Close Logs
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
