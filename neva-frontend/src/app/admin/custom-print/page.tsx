'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  X,
  Check,
  AlertTriangle,
  Download,
  DollarSign,
  Printer,
  ChevronDown
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';

interface PrintRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fileName: string;
  fileSize: string;
  material: string;
  color: string;
  infill: number; // e.g. 20 for 20%
  quantity: number;
  notes: string;
  quotePrice: number | null;
  status: 'pending_review' | 'quote_sent' | 'in_production' | 'completed' | 'cancelled';
  createdAt: string;
}

const INITIAL_MOCK_REQUESTS: PrintRequest[] = [
  {
    id: 'PR-9031',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@gmail.com',
    customerPhone: '+91 98765 43210',
    fileName: 'mechanical_gear_v2.stl',
    fileSize: '14.2 MB',
    material: 'PLA Tough',
    color: 'Matte Black',
    infill: 40,
    quantity: 4,
    notes: 'Please print using 0.12mm high detail layer height. Needs to handle mechanical load.',
    quotePrice: null,
    status: 'pending_review',
    createdAt: '2026-08-19 10:30 AM'
  },
  {
    id: 'PR-9032',
    customerName: 'Sneha Rao',
    customerEmail: 'sneha.rao@yahoo.com',
    customerPhone: '+91 91234 56789',
    fileName: 'architectural_dome_model.obj',
    fileSize: '48.7 MB',
    material: 'PETG',
    color: 'Transparent Translucent',
    infill: 15,
    quantity: 1,
    notes: 'No support structures on the outer dome if possible. It is a visual prototype.',
    quotePrice: 3200,
    status: 'quote_sent',
    createdAt: '2026-08-18 04:15 PM'
  },
  {
    id: 'PR-9033',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.k@rediffmail.com',
    customerPhone: '+91 88888 77777',
    fileName: 'custom_phone_stand.stl',
    fileSize: '3.1 MB',
    material: 'ABS',
    color: 'Red Glossy',
    infill: 30,
    quantity: 10,
    notes: 'Red ABS color. Needs to be polished or acetone-smoothed if possible.',
    quotePrice: 1500,
    status: 'in_production',
    createdAt: '2026-08-18 09:00 AM'
  },
  {
    id: 'PR-9034',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@outlook.com',
    customerPhone: '+91 77777 66666',
    fileName: 'cosplay_helmet_rear.stl',
    fileSize: '102.5 MB',
    material: 'PLA',
    color: 'Gray Basic',
    infill: 20,
    quantity: 1,
    notes: 'Do not scale. Dimensions must match exactly for cosplay fit.',
    quotePrice: 5800,
    status: 'completed',
    createdAt: '2026-08-15 11:20 AM'
  },
  {
    id: 'PR-9035',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@corporate.in',
    customerPhone: '+91 99999 88888',
    fileName: 'enclosure_bracket.stl',
    fileSize: '8.4 MB',
    material: 'Nylon',
    color: 'White',
    infill: 100,
    quantity: 20,
    notes: 'High strength required. Please print using Nylon at 100% solid infill.',
    quotePrice: null,
    status: 'cancelled',
    createdAt: '2026-08-14 02:45 PM'
  }
];

export default function AdminCustomPrintPage() {
  const [requests, setRequests] = useState<PrintRequest[]>(INITIAL_MOCK_REQUESTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quote pricing sub-state
  const [isQuoting, setIsQuoting] = useState(false);
  const [inputPrice, setInputPrice] = useState('');

  // Delete confirmation popup state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<PrintRequest | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Status counters helper
  const getCount = (statusType: string) => {
    if (statusType === 'all') return requests.length;
    return requests.filter(r => r.status === statusType).length;
  };

  // Status update handler
  const handleStatusChange = (id: string, newStatus: PrintRequest['status']) => {
    if (newStatus === 'quote_sent') {
      const targetReq = requests.find(r => r.id === id);
      if (targetReq) {
        setSelectedRequest(targetReq);
        setInputPrice(targetReq.quotePrice?.toString() || '');
        setIsQuoting(true);
        setIsDetailOpen(true);
        return;
      }
    }
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    }));
    showToast(`Status updated successfully! ⚡`);
  };

  // Quote submit handler
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !inputPrice) return;

    setRequests(prev => prev.map(req => {
      if (req.id === selectedRequest.id) {
        return { 
          ...req, 
          quotePrice: parseFloat(inputPrice), 
          status: 'quote_sent' 
        };
      }
      return req;
    }));

    showToast(`Price quote of ₹${inputPrice} sent successfully! 🎉`);
    setIsQuoting(false);
    setIsDetailOpen(false);
    setSelectedRequest(null);
    setInputPrice('');
  };

  // Delete handler
  const handleDeleteRequest = () => {
    if (!requestToDelete) return;
    setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
    showToast(`Request ${requestToDelete.id} deleted successfully! 🗑️`);
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && req.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
          <Printer className="h-7 w-7 text-violet-650" />
          Custom Print Requests
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Manage 3D printing custom quotes, review mesh models, and production lifecycles.</p>
      </div>

      {/* Dynamic Pill Tabs list with counters - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-none">
        <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/80 w-max">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending_review', label: 'Pending Review' },
            { id: 'quote_sent', label: 'Quotes' },
            { id: 'in_production', label: 'In Production' },
            { id: 'completed', label: 'Completed' },
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

      {/* Filter and Search Bar */}
      <div className="flex items-center max-w-sm rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10">
        <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by customer, file name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-zinc-800 placeholder-zinc-400 bg-transparent outline-none"
        />
      </div>

      {/* Table grid - Min width configured to prevent squishing */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">
            {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                <th className="pl-6 pr-2 py-3 w-10">No</th>
                <th className="pl-2 pr-6 py-3">Request ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">3D File</th>
                <th className="px-6 py-3">Specifications</th>
                <th className="px-6 py-3 text-center">Quote</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-400 text-sm">
                    No requests found in this status category.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, index) => (
                  <tr key={req.id} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="pl-6 pr-2 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold whitespace-nowrap">{index + 1}</td>
                    <td className="pl-2 pr-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-violet-700 text-xs bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap">{req.id}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 text-xs">{req.customerName}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{req.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-800 text-xs">{req.fileName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{req.fileSize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-zinc-700 text-xs">{req.material}</span>
                        <span className="bg-violet-50 text-violet-750 border border-violet-100 rounded px-1.5 py-0.5 text-[10px] font-bold">
                          x{req.quantity}
                        </span>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-3.5 text-center whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedRequest(req);
                        setInputPrice(req.quotePrice?.toString() || '');
                        setIsQuoting(true);
                        setIsDetailOpen(true);
                      }}
                      title="Set/Edit Price Quote"
                    >
                      {req.quotePrice ? (
                        <span className="font-bold text-zinc-900 text-xs">₹{req.quotePrice}</span>
                      ) : (
                        <span className="text-[10px] text-orange-600 font-bold bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-full px-3 py-1 border cursor-pointer outline-none text-center bg-white ${
                          req.status === 'pending_review' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          req.status === 'quote_sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          req.status === 'in_production' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                          req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-zinc-100 text-zinc-500 border-zinc-200'
                        }`}
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="quote_sent">Quote Sent</option>
                        <option value="in_production">In Production</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-150 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setRequestToDelete(req);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-150 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Ticket Details & Price Quoting Modal */}
      {isDetailOpen && selectedRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <Printer className="h-5 w-5 text-violet-600" />
                POD Request - {selectedRequest.id}
              </h3>
              <button 
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsQuoting(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 transition"
              >
                <X className="h-4 w-4 text-zinc-500 cursor-pointer" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 pb-2 scrollbar-thin">
              {/* Customer Contact */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3">
                <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block mb-1">Customer Info</span>
                <div className="text-xs font-semibold text-zinc-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Name:</span>
                    <span>{selectedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Email:</span>
                    <span>{selectedRequest.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Phone:</span>
                    <span>{selectedRequest.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* 3D STL file details */}
              <div className="border border-zinc-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-violet-50 text-violet-650 rounded-xl h-10 w-10 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    STL
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-800 truncate">{selectedRequest.fileName}</span>
                    <span className="text-[10px] text-zinc-400 font-medium font-mono">{selectedRequest.fileSize}</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Mock STL file download triggered! 💾')}
                  className="inline-flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition shadow-sm w-full sm:w-auto"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>

              {/* 3D Printing Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-zinc-150 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Material</span>
                  <span className="font-bold text-zinc-800">{selectedRequest.material}</span>
                </div>
                <div className="border border-zinc-150 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Color</span>
                  <span className="font-bold text-zinc-800">{selectedRequest.color}</span>
                </div>
                <div className="border border-zinc-150 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Infill Density</span>
                  <span className="font-bold text-zinc-800">{selectedRequest.infill}%</span>
                </div>
                <div className="border border-zinc-150 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Quantity Requested</span>
                  <span className="font-bold text-zinc-800">{selectedRequest.quantity} units</span>
                </div>
              </div>

              {/* Customer Remarks */}
              <div className="border border-zinc-150 rounded-xl p-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Customer Instructions</span>
                <p className="text-xs text-zinc-650 leading-relaxed font-semibold italic">
                  "{selectedRequest.notes}"
                </p>
              </div>

              {/* Display quote details */}
              <div className="border border-zinc-150 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Price Quote Status</span>
                  <span className="text-xs font-bold text-zinc-800">
                    {selectedRequest.quotePrice ? `₹${selectedRequest.quotePrice}` : 'Unassigned'}
                  </span>
                </div>
                {!isQuoting && (
                  <button
                    onClick={() => {
                      setInputPrice(selectedRequest.quotePrice?.toString() || '');
                      setIsQuoting(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-semibold transition w-full sm:w-auto"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    {selectedRequest.quotePrice ? 'Edit Quote' : 'Set Price Quote'}
                  </button>
                )}
              </div>

              {/* Interactive Quoting Sub-Form */}
              {isQuoting && (
                <form onSubmit={handleSendQuote} className="border border-violet-100 rounded-xl p-4 bg-violet-50/20 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                    <span className="text-xs font-bold text-violet-900">Enter Price Quote Details</span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-violet-700 font-bold uppercase tracking-wider mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuoting(false)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-650 hover:bg-zinc-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition"
                    >
                      Send Price Quote
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsQuoting(false);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {isDeleteModalOpen && requestToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-650" />
            </div>
            
            <h3 className="text-base font-bold text-zinc-900 mb-2">Delete Print Request</h3>
            <p className="text-xs text-zinc-500 mb-6 px-2">
              Are you sure you want to delete custom printing ticket <span className="font-bold text-zinc-800">"{requestToDelete.id}"</span>? This will permanently erase the order ticket.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setRequestToDelete(null);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
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
