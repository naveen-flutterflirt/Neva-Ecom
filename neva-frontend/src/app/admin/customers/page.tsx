'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  X,
  User,
  Calendar,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';

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
}

const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CST-4821',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    phone: '+91 98765 43210',
    shippingAddress: 'Flat 405, Green Glen Layout, Bellandur, Bangalore - 560103',
    joinDate: '2026-05-12',
    totalOrders: 4,
    totalSpent: 12450,
    status: 'active'
  },
  {
    id: 'CST-4822',
    name: 'Aditi Patel',
    email: 'aditi.patel@yahoo.com',
    phone: '+91 91234 56789',
    shippingAddress: 'B-12, Sector 4, HSR Layout, Bangalore - 560102',
    joinDate: '2026-06-18',
    totalOrders: 2,
    totalSpent: 5900,
    status: 'active'
  },
  {
    id: 'CST-4823',
    name: 'Amit Verma',
    email: 'amit.verma@outlook.com',
    phone: '+91 88888 77777',
    shippingAddress: '42, Park Avenue Road, Indiranagar, Bangalore - 560038',
    joinDate: '2026-02-10',
    totalOrders: 12,
    totalSpent: 34200,
    status: 'active'
  },
  {
    id: 'CST-4824',
    name: 'Kavita Iyer',
    email: 'kavita.iyer@gmail.com',
    phone: '+91 77777 66666',
    shippingAddress: 'Villa 9, Prestige Ferns, Koramangala, Bangalore - 560034',
    joinDate: '2026-07-01',
    totalOrders: 1,
    totalSpent: 999,
    status: 'active'
  },
  {
    id: 'CST-4825',
    name: 'Sanjay Nair',
    email: 'sanjay.nair@corporate.in',
    phone: '+91 99999 88888',
    shippingAddress: 'Block C-903, Purva Riviera, Marathahalli, Bangalore - 560037',
    joinDate: '2026-01-15',
    totalOrders: 8,
    totalSpent: 22800,
    status: 'active'
  },
  {
    id: 'CST-4826',
    name: 'Vikram Joshi',
    email: 'vikram.j@gmail.com',
    phone: '+91 81234 56789',
    shippingAddress: '15, 2nd Main, Malleshwaram, Bangalore - 560003',
    joinDate: '2026-04-20',
    totalOrders: 0,
    totalSpent: 0,
    status: 'blocked'
  }
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_MOCK_CUSTOMERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
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

  // Filter list
  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
          <User className="h-7 w-7 text-violet-650" />
          Customers Directory
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Monitor active user profiles, track transaction histories, and manage block lists.</p>
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
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-400 text-sm">
                    No customers found matches your search parameters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, index) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="pl-6 pr-2 py-3.5 font-mono text-zinc-400 text-[11px] font-semibold whitespace-nowrap">{index + 1}</td>
                    <td className="pl-2 pr-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-violet-700 text-xs bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap">{c.id}</span>
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
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-zinc-650 text-xs font-semibold">{c.phone}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="text-zinc-900 font-bold text-xs">{c.totalOrders} orders</span>
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="text-zinc-900 font-bold text-xs">₹{c.totalSpent}</span>
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
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
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
      </div>

      {/* Customer Details Modal */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <User className="h-5 w-5 text-violet-650" />
                Customer Audit Profile - {selectedCustomer.id}
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
              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-150 p-4 rounded-xl">
                <div className="h-12 w-12 rounded-full bg-violet-100 border border-violet-200 text-violet-700 font-extrabold flex items-center justify-center text-sm uppercase">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 truncate">{selectedCustomer.name}</h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${selectedCustomer.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    Account is {selectedCustomer.status}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border border-zinc-200 rounded-xl p-3.5 space-y-3">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block border-b border-zinc-150 pb-1">Contact Channels</span>
                <div className="text-xs font-semibold text-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                    <p className="text-zinc-650 leading-relaxed font-medium">{selectedCustomer.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Transactions stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Orders Placed</span>
                    <span className="font-bold text-zinc-800">{selectedCustomer.totalOrders} orders</span>
                  </div>
                </div>
                <div className="border border-zinc-155 rounded-xl p-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Total Spent</span>
                    <span className="font-bold text-zinc-850">₹{selectedCustomer.totalSpent}</span>
                  </div>
                </div>
              </div>

              {/* Date Joined */}
              <div className="border border-zinc-150 rounded-xl p-3.5 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block">Member Since</span>
                    <span className="font-semibold text-zinc-700">{selectedCustomer.joinDate}</span>
                  </div>
                </div>
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
