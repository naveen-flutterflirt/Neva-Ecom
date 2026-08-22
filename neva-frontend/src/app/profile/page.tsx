'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Clock,
  Printer,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  Package,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Zap,
  Box,
  MapPin,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

interface CustomPrintItem {
  id: string;
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string | null;
  material: string;
  color: string;
  quality?: string;
  height?: string;
  infill: number;
  quantity: number;
  notes: string;
  quotePrice: number | null;
  status: 'pending_review' | 'quote_sent' | 'in_production' | 'completed' | 'cancelled';
  createdAt: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  frontImage?: string | null;
  sideImage?: string | null;
  backImage?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<{
    id?: string;
    name: string;
    email: string;
    whatsappNumber?: string;
    contactNumber?: string;
    role?: string;
    createdAt?: string;
  }>({
    name: 'Suman Kumar',
    email: 'suman.kumar@example.com',
    whatsappNumber: '9876543210',
    contactNumber: '9876543210',
    role: 'customer',
    createdAt: '2026-08-15'
  });

  const [customRequests, setCustomRequests] = useState<CustomPrintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'custom_orders' | 'account' | 'addresses'>('custom_orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`✓ ${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch logged in user & user custom products
  useEffect(() => {
    const token = localStorage.getItem('neva-token');
    if (!token) {
      setIsAuth(false);
      setIsLoading(false);
      return;
    }
    setIsAuth(true);

    const loadProfileData = async () => {
      try {
        setIsLoading(true);

        // Fetch User Info
        let currentUserEmail = '';
        try {
          const profileRes = await apiClient('/auth/me');
          if (profileRes && profileRes.data) {
            setUserInfo(profileRes.data);
            if (profileRes.data.email) {
              currentUserEmail = profileRes.data.email;
            }
          }
        } catch (e) {
          localStorage.removeItem('neva-token');
          setIsAuth(false);
          return;
        }

        // Fetch Custom Print Requests for logged-in user email
        const endpoint = currentUserEmail
          ? `/custom-print?email=${encodeURIComponent(currentUserEmail)}`
          : '/custom-print';
        const printRes = await apiClient(endpoint);

        if (printRes && Array.isArray(printRes.data)) {
          const mappedData: CustomPrintItem[] = printRes.data.map((item: any) => ({
            id: item.id,
            requestId: item.requestId || item.id,
            customerName: item.customerName,
            customerEmail: item.customerEmail,
            customerPhone: item.customerPhone,
            fileName: item.fileName,
            fileSize: item.fileSize || '10.0 MB',
            fileUrl: item.fileUrl || null,
            material: item.material,
            color: item.color,
            quality: item.quality || item.height || '6 Inch',
            height: item.height || item.quality || '6 Inch',
            infill: item.infill || 20,
            quantity: item.quantity || 1,
            notes: item.notes || '',
            quotePrice: item.quotePrice ? parseFloat(item.quotePrice) : null,
            status: item.status || 'pending_review',
            createdAt: new Date(item.createdAt).toLocaleString(),
            addressLine1: item.addressLine1 || '',
            addressLine2: item.addressLine2 || '',
            city: item.city || '',
            state: item.state || '',
            zipCode: item.zipCode || '',
            frontImage: item.frontImage || null,
            sideImage: item.sideImage || null,
            backImage: item.backImage || null,
          }));

          const userFiltered = currentUserEmail
            ? mappedData.filter(
                r => r.customerEmail.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
              )
            : mappedData;

          setCustomRequests(userFiltered);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleDownload = (fileUrl?: string | null, fileName?: string) => {
    if (!fileUrl) {
      showToast('No 3D file URL available for download.');
      return;
    }
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'model.stl';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloading ${fileName || '3D file'}... 💾`);
  };

  const getStatusConfig = (rawStatus: string) => {
    const s = (rawStatus || '').toLowerCase().trim().replace(/[\s-]/g, '_');
    if (s === 'pending_review' || s === 'pending' || s.includes('review')) {
      return {
        label: 'Pending Review',
        step: 1,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
      };
    }
    if (s === 'quote_sent' || s === 'quoted' || s.includes('quote')) {
      return {
        label: 'Quote Sent',
        step: 2,
        badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
      };
    }
    if (s === 'in_production' || s === 'production' || s.includes('production')) {
      return {
        label: 'In Production',
        step: 3,
        badgeClass: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40'
      };
    }
    if (s === 'completed' || s.includes('complete') || s.includes('dispatch')) {
      return {
        label: 'Completed',
        step: 4,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
      };
    }
    if (s === 'cancelled' || s.includes('cancel')) {
      return {
        label: 'Cancelled',
        step: 0,
        badgeClass: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
      };
    }
    return {
      label: rawStatus || 'Pending Review',
      step: 1,
      badgeClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
    };
  };

  // Filtered requests
  const filteredRequests = customRequests.filter(req => {
    const matchesSearch =
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeOrdersCount = customRequests.filter(
    r => r.status === 'in_production' || r.status === 'pending_review' || r.status === 'quote_sent'
  ).length;

  if (isAuth === false) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] pt-28 pb-16 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="h-16 w-16 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto border border-violet-200 dark:border-violet-800/40">
            <User className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Please sign in to access your user profile and live custom product print orders.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-violet-600/20 flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              Sign In to Your Account
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-[#090a0f] pt-24 pb-20 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-violet-500 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono font-medium">Customer Portal</span>
        </div>

        {/* Clean Modern Profile Header Card */}
        <div className="relative rounded-2xl bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* User Avatar & Title Info */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-0.5 shadow-md shrink-0">
                  <div className="h-full w-full bg-zinc-900 rounded-[14px] flex items-center justify-center font-bold text-xl sm:text-2xl text-white">
                    {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#12131a]" title="Active Account" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{userInfo.name}</h1>
                  <span className="bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/50 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                    Verified Account
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-zinc-400" /> {userInfo.email}</span>
                  {userInfo.contactNumber && (
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {userInfo.contactNumber}</span>
                  )}
                  {userInfo.whatsappNumber && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> WA: {userInfo.whatsappNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/custom-products/product-info"
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
              >
                <Printer className="h-4 w-4" />
                New Print Request
              </Link>
            </div>

          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('custom_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'custom_orders'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Printer className="h-4 w-4" />
            Custom 3D Print Orders
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedTab === 'custom_orders' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
            }`}>
              {customRequests.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedTab('account')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'account'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <User className="h-4 w-4" />
            Personal Details
          </button>

          <button
            onClick={() => setSelectedTab('addresses')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'addresses'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Shipping Address
          </button>
        </div>

        {/* TAB 1: Custom Orders */}
        {selectedTab === 'custom_orders' && (
          <div className="space-y-6">

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search order ID, model file, or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">Filter:</span>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending_review', label: 'In Review' },
                  { id: 'quote_sent', label: 'Quoted' },
                  { id: 'in_production', label: 'Production' },
                  { id: 'completed', label: 'Completed' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                      filterStatus === st.id
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            {isLoading ? (
              <div className="p-16 text-center text-zinc-400 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-3">
                <Clock className="h-8 w-8 text-violet-500 animate-spin mx-auto" />
                <p className="text-xs font-medium">Loading your print orders...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-4 shadow-sm">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Box className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">No custom print orders found</h3>
                  <p className="text-xs text-zinc-500 mt-1">You have no custom product requests matching your criteria.</p>
                </div>
                <Link
                  href="/custom-products/product-info"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
                >
                  Configure 3D Print Request
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredRequests.map((req) => {
                  const statusConfig = getStatusConfig(req.status);
                  const activeStepIdx = statusConfig.step;
                  return (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                    >

                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0">
                            STL
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-base font-bold text-zinc-900 dark:text-white">{req.requestId}</span>
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${statusConfig.badgeClass}`}>
                                {activeStepIdx === 4 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                                {statusConfig.label}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 font-normal block mt-0.5">Submitted on {req.createdAt}</span>
                          </div>
                        </div>

                        {/* Price Quote Tag */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Price Quote</span>
                            <span className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                              {req.quotePrice ? `₹${req.quotePrice.toLocaleString()}` : 'Pending Quote'}
                            </span>
                          </div>

                          {req.fileUrl && (
                            <button
                              onClick={() => handleDownload(req.fileUrl, req.fileName)}
                              className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-sm transition"
                              title="Download 3D Model File"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Clean Horizontal Status Pipeline */}
                      <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400">Order Progress Timeline</span>
                          <span className={`font-semibold ${activeStepIdx === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`}>
                            {activeStepIdx === 4 ? '✓ All Steps Completed' : activeStepIdx > 0 ? `Step ${activeStepIdx} of 4` : 'Cancelled'}
                          </span>
                        </div>

                        <div className="relative pt-2 pb-1">
                          <div className="absolute top-4 left-6 right-6 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2" />
                          <div
                            className={`absolute top-4 left-6 h-0.5 -translate-y-1/2 transition-all duration-500 ${
                              activeStepIdx === 4 ? 'bg-emerald-500' : 'bg-violet-600'
                            }`}
                            style={{
                              width: activeStepIdx === 1 ? '0%' : activeStepIdx === 2 ? '33%' : activeStepIdx === 3 ? '66%' : activeStepIdx === 4 ? '100%' : '0%'
                            }}
                          />

                          <div className="relative z-10 flex items-center justify-between">
                            {[
                              { label: 'Pending Review', step: 1 },
                              { label: 'Quote Sent', step: 2 },
                              { label: 'In Production', step: 3 },
                              { label: 'Completed', step: 4 }
                            ].map((s) => {
                              const isPassed = activeStepIdx >= s.step && activeStepIdx > 0;
                              const isCurrent = activeStepIdx === s.step && activeStepIdx !== 4;
                              const isFullyCompleted = activeStepIdx === 4 && s.step <= 4;
                              const showCheckmark = isFullyCompleted || (isPassed && !isCurrent);
                              return (
                                <div key={s.label} className="flex flex-col items-center select-none">
                                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                                    showCheckmark
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/20'
                                      : isCurrent
                                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                      : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                                  }`}>
                                    {showCheckmark ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.step}
                                  </span>
                                  <span className={`text-[10px] mt-1.5 font-medium ${
                                    isFullyCompleted
                                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                      : isCurrent
                                      ? 'text-violet-600 dark:text-violet-400 font-semibold'
                                      : isPassed
                                      ? 'text-zinc-700 dark:text-zinc-300'
                                      : 'text-zinc-400'
                                  }`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Model File</span>
                            <span className="font-mono font-medium text-zinc-900 dark:text-white truncate block mt-0.5">{req.fileName}</span>
                          </div>

                          <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Material</span>
                            <span className="font-medium text-zinc-900 dark:text-white block mt-0.5">{req.material}</span>
                          </div>

                          <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Color</span>
                            <span className="font-medium text-zinc-900 dark:text-white block mt-0.5">{req.color}</span>
                          </div>

                          <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Height</span>
                            <span className="font-medium text-zinc-900 dark:text-white block mt-0.5">{req.height || req.quality || '6 Inch'} ({req.infill}%)</span>
                          </div>

                          {req.notes && (
                            <div className="col-span-2 sm:col-span-4 bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl">
                              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Instructions</span>
                              <p className="text-zinc-600 dark:text-zinc-300 italic text-xs mt-0.5">"{req.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* Reference Images */}
                        <div className="md:col-span-4 bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/50 p-3 rounded-xl flex flex-col justify-between">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Reference Views</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: 'Front', img: req.frontImage },
                              { label: 'Side', img: req.sideImage },
                              { label: 'Back', img: req.backImage }
                            ].map((ref, idx) => (
                              <div key={idx} className="flex flex-col items-center group/img">
                                <span className="text-[9px] font-medium text-zinc-400 mb-0.5">{ref.label}</span>
                                <div className="h-14 w-full rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden relative flex items-center justify-center">
                                  {ref.img ? (
                                    <>
                                      <img src={ref.img} alt={ref.label} className="h-full w-full object-contain p-0.5" />
                                      <button
                                        onClick={() => setPreviewImage(ref.img || null)}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white"
                                        title="View Photo"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[9px] text-zinc-400 italic">None</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Personal Details */}
        {selectedTab === 'account' && (
          <div className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                Personal Profile Details
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Your registered personal credentials submitted during registration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Full Name</label>
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.name}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(userInfo.name, 'Name')}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                  title="Copy Name"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Email Address</label>
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.email}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(userInfo.email, 'Email')}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                  title="Copy Email"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">WhatsApp Number</label>
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.whatsappNumber || userInfo.contactNumber || 'N/A'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(userInfo.whatsappNumber || '', 'WhatsApp')}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                  title="Copy WhatsApp Number"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Contact Phone</label>
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.contactNumber || userInfo.whatsappNumber || 'N/A'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(userInfo.contactNumber || '', 'Contact Number')}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                  title="Copy Contact Number"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Account Role</label>
                <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5 capitalize">{userInfo.role || 'Customer'}</span>
              </div>

              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-4 space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Member Since</label>
                <span className="font-semibold text-sm text-zinc-900 dark:text-white block mt-0.5">
                  {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'August 2026'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Shipping Addresses */}
        {selectedTab === 'addresses' && (
          <div className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                Primary Shipping Address
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Destination address for custom print deliveries.</p>
            </div>

            <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-white">{userInfo.name}</span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 uppercase">Default</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {customRequests[0]?.addressLine1 || 'Electronic City Phase 1'}, {customRequests[0]?.city || 'Bengaluru'}, {customRequests[0]?.state || 'Karnataka'} - {customRequests[0]?.zipCode || '560100'}
                </p>
                <span className="text-[11px] text-zinc-400 block font-mono">Phone: {userInfo.contactNumber || '+91 98765 43210'}</span>
              </div>

              <Link
                href="/custom-products/product-info"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition shrink-0 text-center shadow-sm"
              >
                Update Address
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Image Preview Overlay Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full bg-zinc-900 rounded-2xl p-3 overflow-hidden shadow-2xl border border-zinc-800" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={previewImage} alt="Reference Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
    </main>
  );
}
