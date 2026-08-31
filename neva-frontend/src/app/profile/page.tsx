'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ExternalLink,
  ShoppingBag,
  Truck,
  CreditCard,
  Home,
  Building,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface SavedAddress {
  id: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

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

interface EcomOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface EcomOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  codFee: number;
  gstTax: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'pending' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  trackingNumber?: string | null;
  createdAt: string;
  items: EcomOrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<{
    id?: string;
    name: string;
    email: string;
    whatsappNumber?: string;
    contactNumber?: string;
    address?: string;
    role?: string;
    createdAt?: string;
  }>({
    name: 'Customer',
    email: 'n/a',
    whatsappNumber: '',
    contactNumber: '',
    address: '',
    role: 'customer',
    createdAt: ''
  });

  const [customRequests, setCustomRequests] = useState<CustomPrintItem[]>([]);
  const [ecomOrders, setEcomOrders] = useState<EcomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'my_orders' | 'custom_orders' | 'account' | 'addresses'>('my_orders');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'my_orders' || tabParam === 'orders') {
        setSelectedTab('my_orders');
      } else if (tabParam === 'custom_orders') {
        setSelectedTab('custom_orders');
      } else if (tabParam === 'account') {
        setSelectedTab('account');
      } else if (tabParam === 'addresses') {
        setSelectedTab('addresses');
      }
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editContact, setEditContact] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Multi-Address State Management
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrType, setAddrType] = useState<'home' | 'work' | 'other'>('home');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Quote Payment Modal State
  const [payingQuoteRequest, setPayingQuoteRequest] = useState<CustomPrintItem | null>(null);
  const [quotePaymentMethod, setQuotePaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isProcessingQuotePayment, setIsProcessingQuotePayment] = useState(false);

  const handleConfirmQuotePayment = async () => {
    if (!payingQuoteRequest || !payingQuoteRequest.quotePrice) return;
    try {
      setIsProcessingQuotePayment(true);
      const targetBackendId = payingQuoteRequest.id;
      const amountToPay = payingQuoteRequest.quotePrice;

      // Helper function to complete order & status updates in backend DB
      const completeQuoteOrderInDb = async (paymentMethodLabel: string, razorpayOrderId?: string, razorpayPaymentId?: string) => {
        await apiClient(`/custom-print/${targetBackendId}`, {
          method: 'PUT',
          body: {
            status: 'in_production',
            paymentStatus: 'paid',
            paymentMethod: paymentMethodLabel
          }
        }).catch(err => console.warn('Custom print status update error:', err));

        await apiClient('/orders', {
          method: 'POST',
          body: {
            orderNumber: payingQuoteRequest.requestId,
            customerName: payingQuoteRequest.customerName || userInfo.name,
            customerEmail: payingQuoteRequest.customerEmail || userInfo.email,
            shippingAddress: payingQuoteRequest.addressLine1 ? `${payingQuoteRequest.addressLine1}, ${payingQuoteRequest.city || ''}` : 'As specified',
            totalAmount: amountToPay,
            paymentMethod: quotePaymentMethod,
            paymentStatus: 'paid',
            orderStatus: 'in_production',
            razorpayPaymentId: razorpayPaymentId || undefined,
            razorpayOrderId: razorpayOrderId || undefined,
            items: [{
              productName: `Custom 3D Print (${payingQuoteRequest.fileName})`,
              unitPrice: amountToPay,
              quantity: payingQuoteRequest.quantity || 1
            }]
          }
        }).catch(err => console.warn('Order sync error:', err));

        setCustomRequests(prev => prev.map(r => {
          if (r.id === targetBackendId || r.requestId === payingQuoteRequest.requestId) {
            return { ...r, status: 'in_production' };
          }
          return r;
        }));

        showToast(`Payment of ₹${amountToPay.toLocaleString()} Verified!`);
        setPayingQuoteRequest(null);
      };

      // Online Gateway Payment via Razorpay
      if (quotePaymentMethod !== 'cod') {
        const scriptLoaded = await loadRazorpayScript();
        const orderRes = await apiClient('/payment/create-order', {
          method: 'POST',
          body: {
            amount: amountToPay,
            receipt: `rcpt_quote_${Date.now()}`,
            notes: {
              customerName: payingQuoteRequest.customerName || userInfo.name,
              email: payingQuoteRequest.customerEmail || userInfo.email,
              requestId: payingQuoteRequest.requestId
            }
          }
        });

        if (orderRes && orderRes.success && orderRes.order) {
          const razorpayKey = orderRes.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TSnKuVgteVheGX';
          const razorpayOrder = orderRes.order;

          if (scriptLoaded && typeof window !== 'undefined' && window.Razorpay) {
            const options = {
              key: razorpayKey,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              name: 'NIVASHOP - 3D Printing',
              description: `Quote Payment for Request ${payingQuoteRequest.requestId}`,
              image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80',
              order_id: razorpayOrder.id,
              prefill: {
                name: payingQuoteRequest.customerName || userInfo.name,
                email: payingQuoteRequest.customerEmail || userInfo.email,
                contact: payingQuoteRequest.customerPhone || userInfo.contactNumber || userInfo.whatsappNumber || '',
                method: quotePaymentMethod === 'card' ? 'card' : quotePaymentMethod === 'upi' ? 'upi' : undefined
              },
              theme: { color: '#7c3aed' },
              handler: async function (response: any) {
                try {
                  const verifyRes = await apiClient('/payment/verify', {
                    method: 'POST',
                    body: {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    }
                  });

                  if (verifyRes && verifyRes.success) {
                    await completeQuoteOrderInDb(`Paid via Razorpay (${quotePaymentMethod.toUpperCase()})`, response.razorpay_order_id, response.razorpay_payment_id);
                  } else {
                    showToast('❌ Razorpay payment signature verification failed!');
                  }
                } catch (err: any) {
                  console.error('Razorpay verify error:', err);
                  showToast('❌ Error verifying payment. Please contact support.');
                } finally {
                  setIsProcessingQuotePayment(false);
                }
              },
              modal: {
                ondismiss: function () {
                  showToast('⚠️ Payment checkout window closed.');
                  setIsProcessingQuotePayment(false);
                }
              }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            return;
          }
        }
      }

      // COD Order Flow
      await completeQuoteOrderInDb('Pay on Delivery (COD)');

    } catch (err: any) {
      console.error('Failed to process quote payment:', err);
      showToast(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessingQuotePayment(false);
    }
  };

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

  const resetAddressForm = () => {
    setAddrStreet('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrType('home');
    setEditingAddressId(null);
    setIsAddingNewAddress(false);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrStreet(addr.street || '');
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPincode(addr.pincode || '');
    setAddrType(addr.type || 'home');
    setIsAddingNewAddress(true);
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setIsAddingNewAddress(true);
  };

  const saveAddressesToBackend = async (newAddresses: SavedAddress[]) => {
    try {
      setIsSavingAddress(true);
      const jsonStr = JSON.stringify(newAddresses);
      const res = await apiClient('/auth/profile', {
        method: 'PUT',
        body: { address: jsonStr }
      });
      if (res && res.data) {
        setUserInfo(prev => ({ ...prev, address: jsonStr }));
        setSavedAddresses(newAddresses);
        localStorage.setItem('neva-user', JSON.stringify(res.data));
        showToast('✓ Shipping addresses updated successfully! 🏠');
        resetAddressForm();
      }
    } catch (err: any) {
      console.error('Failed to update address:', err);
      showToast(err.message || '⚠️ Failed to save shipping address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      showToast('⚠️ Name and Email address are required.');
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await apiClient('/auth/profile', {
        method: 'PUT',
        body: {
          name: editName,
          email: editEmail,
          whatsappNumber: editWhatsapp,
          contactNumber: editContact
        }
      });
      if (res && res.data) {
        setUserInfo(prev => ({ ...prev, ...res.data }));
        localStorage.setItem('neva-user', JSON.stringify(res.data));
        showToast('✓ Personal details updated successfully! ✨');
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      console.error('Failed to update profile details:', err);
      showToast(err.message || '⚠️ Failed to update personal details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveShippingAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrPincode.trim()) {
      showToast('⚠️ Please fill in all required address fields.');
      return;
    }

    let updatedList: SavedAddress[] = [];

    if (editingAddressId) {
      updatedList = savedAddresses.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            street: addrStreet.trim(),
            landmark: addrLandmark.trim(),
            city: addrCity.trim(),
            state: addrState.trim(),
            pincode: addrPincode.trim(),
            type: addrType,
          };
        }
        return a;
      });
    } else {
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        street: addrStreet.trim(),
        landmark: addrLandmark.trim(),
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        type: addrType,
        isDefault: savedAddresses.length === 0
      };
      updatedList = [...savedAddresses, newAddr];
    }

    await saveAddressesToBackend(updatedList);
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    await saveAddressesToBackend(updated);
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await saveAddressesToBackend(updated);
  };

  // Fetch logged in user, user store orders & custom print requests
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
        let currentUserId = '';
        try {
          const profileRes = await apiClient('/auth/me');
          if (profileRes && profileRes.data) {
            setUserInfo(profileRes.data);
            setEditName(profileRes.data.name || '');
            setEditEmail(profileRes.data.email || '');
            setEditWhatsapp(profileRes.data.whatsappNumber || profileRes.data.contactNumber || '');
            setEditContact(profileRes.data.contactNumber || profileRes.data.whatsappNumber || '');
            if (profileRes.data.address) {
              const raw = profileRes.data.address.trim();
              try {
                if (raw.startsWith('[')) {
                  setSavedAddresses(JSON.parse(raw));
                } else if (raw.length > 0) {
                  setSavedAddresses([{
                    id: '1',
                    street: raw,
                    city: '',
                    state: '',
                    pincode: '',
                    type: 'home',
                    isDefault: true
                  }]);
                }
              } catch (err) {
                setSavedAddresses([{
                  id: '1',
                  street: raw,
                  city: '',
                  state: '',
                  pincode: '',
                  type: 'home',
                  isDefault: true
                }]);
              }
            }

            if (profileRes.data.email) currentUserEmail = profileRes.data.email;
            if (profileRes.data.id) currentUserId = profileRes.data.id;
          }
        } catch (e) {
          localStorage.removeItem('neva-token');
          localStorage.removeItem('neva-user');
          localStorage.removeItem('neva-saved-addresses');
          setIsAuth(false);
          return;
        }

        // 1. Fetch E-commerce Store Orders
        try {
          const queryParam = currentUserEmail && currentUserId
            ? `email=${encodeURIComponent(currentUserEmail)}&userId=${currentUserId}`
            : currentUserEmail
              ? `email=${encodeURIComponent(currentUserEmail)}`
              : currentUserId
                ? `userId=${currentUserId}`
                : '';
          const ordersRes = await apiClient(`/orders?${queryParam}`);
          if (ordersRes && Array.isArray(ordersRes.data)) {
            const mappedOrders: EcomOrder[] = ordersRes.data.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber || o.id,
              totalAmount: Number(o.totalAmount || 0),
              subtotal: Number(o.subtotal || 0),
              shippingFee: Number(o.shippingFee || 0),
              codFee: Number(o.codFee || 0),
              gstTax: Number(o.gstTax || 0),
              paymentMethod: (o.paymentMethod || 'UPI').toUpperCase(),
              paymentStatus: o.paymentStatus || 'pending',
              orderStatus: o.orderStatus || 'pending',
              shippingAddress: o.shippingAddress || 'No address provided',
              trackingNumber: o.trackingNumber || null,
              createdAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              items: Array.isArray(o.items) ? o.items.map((it: any) => ({
                id: it.id,
                productId: it.productId,
                productName: it.productName || 'Product',
                productImage: it.productImage || '',
                quantity: Number(it.quantity || 1),
                unitPrice: Number(it.unitPrice || 0),
                totalPrice: Number(it.totalPrice || 0),
              })) : [],
            }));
            setEcomOrders(mappedOrders);
          }
        } catch (ordErr) {
          console.warn('Failed to fetch e-commerce orders:', ordErr);
        }

        // 2. Fetch Custom Print Requests for logged-in user email
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

  const getEcomOrderStatusConfig = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered') {
      return { step: 4, label: 'Delivered 🎉', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' };
    }
    if (s === 'shipped' || s === 'ready_to_ship') {
      return { step: 3, label: 'Shipped / Dispatched', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40' };
    }
    if (s === 'in_production') {
      return { step: 2, label: 'In Production / Processing ⚙️', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40' };
    }
    if (s === 'confirmed' || s === 'pending' || s === 'pending_payment') {
      return { step: 1, label: 'Order Confirmed ✅', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40' };
    }
    if (s === 'cancelled') {
      return { step: 0, label: 'Cancelled ❌', badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40' };
    }
    return { step: 1, label: 'Order Received', badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' };
  };

  // Filtered requests & orders
  const filteredCustomRequests = customRequests.filter(req => {
    const matchesSearch =
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredEcomOrders = ecomOrders.filter(ord => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some(it => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || ord.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
              Please sign in to access your user profile and track live store & custom print orders.
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
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-20 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-violet-500 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 transition-colors bg-white dark:bg-[#12131a] px-3.5 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Shop
          </Link>
          <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800/40">
            CUSTOMER DASHBOARD
          </span>
        </div>

        {/* Hero Glassmorphic Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xl shadow-zinc-200/30 dark:shadow-none">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* User Avatar & Details */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-0.5 shadow-md shadow-violet-600/20">
                  <div className="h-full w-full bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[14px] flex items-center justify-center font-black text-xl text-white uppercase">
                    {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white truncate capitalize">
                    {userInfo.name}
                  </h1>

                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {userInfo.email}
                  </span>
                  {(userInfo.contactNumber || userInfo.whatsappNumber) && (
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      {userInfo.contactNumber || userInfo.whatsappNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button - Flipkart Style Edit Profile */}
            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('account');
                  setIsEditingProfile(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Pill Tabs Navigation */}
        <div className="p-1.5 bg-white/90 dark:bg-[#151824]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setSelectedTab('my_orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${selectedTab === 'my_orders'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${selectedTab === 'my_orders' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}>
                {ecomOrders.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('custom_orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${selectedTab === 'custom_orders'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
            >
              <Printer className="h-4 w-4" />
              Custom Orders
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${selectedTab === 'custom_orders' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}>
                {customRequests.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('account')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${selectedTab === 'account'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
            >
              <User className="h-4 w-4" />
              Personal Details
            </button>

            <button
              onClick={() => setSelectedTab('addresses')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${selectedTab === 'addresses'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
            >
              <MapPin className="h-4 w-4" />
              Shipping Address
            </button>
          </div>
        </div>

        {/* TAB 1: My Store Orders */}
        {selectedTab === 'my_orders' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Order ID or Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1 shrink-0">Filter:</span>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'in_production', label: 'Processing' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'delivered', label: 'Delivered' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${filterStatus === st.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Orders Feed */}
            {isLoading ? (
              <div className="p-16 text-center text-zinc-400 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-3">
                <Clock className="h-8 w-8 text-violet-500 animate-spin mx-auto" />
                <p className="text-xs font-medium">Fetching live store orders...</p>
              </div>
            ) : filteredEcomOrders.length === 0 ? (
              <div className="p-12 sm:p-16 text-center bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-4 shadow-sm">
                <div className="h-14 w-14 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-800/40">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">No store orders found</h3>
                  <p className="text-xs text-zinc-500 mt-1">Explore our 3D Printed products and smart IoT devices!</p>
                </div>
                <Link
                  href="/3d-product"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Explore 3D Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEcomOrders.map((ord) => {
                  const statusConfig = getEcomOrderStatusConfig(ord.orderStatus);
                  const activeStepIdx = statusConfig.step;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center shrink-0 shadow-xs">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-base sm:text-lg font-black text-zinc-900 dark:text-white">{ord.orderNumber}</span>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${statusConfig.badgeClass}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium block mt-0.5">Placed on {ord.createdAt}</span>
                          </div>
                        </div>

                        {/* Payment & Total Amount Tag */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl sm:bg-transparent sm:p-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              Payment ({ord.paymentMethod})
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {ord.paymentStatus}
                            </span>
                          </div>

                          <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-4 sm:pl-5">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Amount</span>
                            <span className="text-base sm:text-lg font-black text-violet-600 dark:text-violet-400 font-mono">
                              ₹{ord.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FLIPKART/AMAZON STYLE COMPACT SEGMENTED STATUS PIPELINE (ZERO OVERFLOW) */}
                      <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-3.5 sm:p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-200/40 dark:border-zinc-800/40">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
                            <Truck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            Order Delivery Status
                          </span>
                          <span className={`font-bold text-[11px] sm:text-xs ${activeStepIdx === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`}>
                            {activeStepIdx === 4 ? '✓ Delivered' : activeStepIdx > 0 ? `Step ${activeStepIdx} of 4` : 'Cancelled'}
                          </span>
                        </div>

                        <div className="overflow-x-auto scrollbar-none py-1">
                          <div className="flex items-center justify-between min-w-[340px] sm:min-w-0 px-1.5">
                            {[
                              { label: 'Order Confirmed', step: 1 },
                              { label: 'In Production', step: 2 },
                              { label: 'Shipped', step: 3 },
                              { label: 'Delivered', step: 4 }
                            ].map((s, idx, arr) => {
                              const isPassed = activeStepIdx >= s.step && activeStepIdx > 0;
                              const isCurrent = activeStepIdx === s.step && activeStepIdx !== 4;
                              const isFullyCompleted = activeStepIdx === 4;

                              return (
                                <React.Fragment key={s.label}>
                                  {/* Step Circle Node */}
                                  <div className="flex flex-col items-center shrink-0 z-10">
                                    <div
                                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-black transition-all border ${isFullyCompleted || (isPassed && !isCurrent)
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/10'
                                        : isCurrent
                                          ? 'bg-violet-600 text-white border-violet-600 shadow-xs ring-2 ring-violet-600/20 animate-pulse'
                                          : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-300 dark:border-zinc-700'
                                        }`}
                                    >
                                      {isFullyCompleted || (isPassed && !isCurrent) ? (
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                      ) : (
                                        <span>{s.step}</span>
                                      )}
                                    </div>

                                    <span
                                      className={`text-[10px] sm:text-[11px] mt-1 font-semibold text-center whitespace-nowrap ${isFullyCompleted
                                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                        : isCurrent
                                          ? 'text-violet-600 dark:text-violet-400 font-bold'
                                          : isPassed
                                            ? 'text-zinc-700 dark:text-zinc-300 font-semibold'
                                            : 'text-zinc-400 dark:text-zinc-500'
                                        }`}
                                    >
                                      {s.label}
                                    </span>
                                  </div>

                                  {/* Segmented Line between adjacent circles - ONLY between steps, NEVER on outer edges! */}
                                  {idx < arr.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-1 sm:mx-2 -mt-4 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${activeStepIdx > s.step ? (isFullyCompleted ? 'bg-emerald-500' : 'bg-violet-600') : 'bg-transparent'
                                          }`}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Items Purchased List */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Items Purchased ({ord.items.length}):</span>
                        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-3 sm:p-4 space-y-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-2 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.productImage ? (
                                  <img src={item.productImage} alt={item.productName} className="h-11 w-11 rounded-xl object-contain bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shrink-0 p-0.5" />
                                ) : (
                                  <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center shrink-0 border border-violet-200 dark:border-violet-800">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <span className="font-bold text-zinc-900 dark:text-white block truncate text-xs sm:text-sm">{item.productName}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">Unit Price: ₹{item.unitPrice}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-zinc-100 dark:border-zinc-800/40 pt-2 sm:border-0 sm:pt-0">
                                <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">Qty: <strong className="text-zinc-900 dark:text-white font-bold">{item.quantity}</strong></span>
                                <span className="font-mono font-black text-violet-600 dark:text-violet-400 text-xs sm:text-sm">₹{item.totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>


                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Custom 3D Print Orders */}
        {selectedTab === 'custom_orders' && (
          <div className="space-y-6">

            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Request ID or file..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1 shrink-0">Filter:</span>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${filterStatus === st.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Print Requests Feed */}
            {isLoading ? (
              <div className="p-16 text-center text-zinc-400 bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-3">
                <Clock className="h-8 w-8 text-violet-500 animate-spin mx-auto" />
                <p className="text-xs font-medium">Loading your print requests...</p>
              </div>
            ) : filteredCustomRequests.length === 0 ? (
              <div className="p-12 sm:p-16 text-center bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-4 shadow-sm">
                <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Box className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">No custom print orders found</h3>
                  <p className="text-xs text-zinc-500 mt-1">Upload your custom 3D STL file to receive a price quote!</p>
                </div>
                <Link
                  href="/custom-product"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Configure 3D Print Request
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCustomRequests.map((req) => {
                  const statusConfig = getStatusConfig(req.status);
                  const activeStepIdx = statusConfig.step;
                  return (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 shadow-xs">
                            STL
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-base sm:text-lg font-black text-zinc-900 dark:text-white">{req.requestId}</span>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${statusConfig.badgeClass}`}>
                                {activeStepIdx === 4 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                                {statusConfig.label}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium block mt-0.5">Submitted on {req.createdAt}</span>
                          </div>
                        </div>

                        {/* Price Quote Tag & Pay Now Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl sm:bg-transparent sm:p-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Price Quote</span>
                            <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                              {req.quotePrice ? `₹${req.quotePrice.toLocaleString()}` : 'Pending Quote'}
                            </span>
                          </div>

                          {(req.status === 'quote_sent' || (req.quotePrice && req.status === 'pending_review')) && (
                            <button
                              onClick={() => {
                                setPayingQuoteRequest(req);
                                setQuotePaymentMethod('upi');
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-violet-600/25 transition active:scale-95 flex items-center gap-1.5 shrink-0"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </button>
                          )}

                          {req.fileUrl && (
                            <button
                              onClick={() => handleDownload(req.fileUrl, req.fileName)}
                              className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-600/20 transition active:scale-95"
                              title="Download 3D Model File"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* QUOTE APPROVED HIGHLIGHT BANNER WITH PAY NOW BUTTON */}
                      {(req.status === 'quote_sent' || (req.quotePrice && req.status !== 'in_production' && req.status !== 'completed')) && (
                        <div className="bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 border border-violet-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-violet-600/30">
                              ₹
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                                  Admin Price Quote Ready!
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                                  Approved
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                                Engineering quote approved for <strong className="text-zinc-950 dark:text-white font-bold">₹{req.quotePrice?.toLocaleString()}</strong>. Complete payment to start 3D printing.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPayingQuoteRequest(req);
                              setQuotePaymentMethod('upi');
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-violet-600/30 transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now (₹{req.quotePrice?.toLocaleString()})
                          </button>
                        </div>
                      )}

                      {/* FLIPKART/AMAZON STYLE COMPACT SEGMENTED CUSTOM PRINT PIPELINE (ZERO OVERFLOW) */}
                      <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-3.5 sm:p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-200/40 dark:border-zinc-800/40">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
                            <Printer className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            3D Print Progress Timeline
                          </span>
                          <span className={`font-bold text-[11px] sm:text-xs ${activeStepIdx === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`}>
                            {activeStepIdx === 4 ? '✓ Completed' : activeStepIdx > 0 ? `Step ${activeStepIdx} of 4` : 'Cancelled'}
                          </span>
                        </div>

                        <div className="overflow-x-auto scrollbar-none py-1">
                          <div className="flex items-center justify-between min-w-[340px] sm:min-w-0 px-1.5">
                            {[
                              { label: 'Pending Review', step: 1 },
                              { label: 'Quote Sent', step: 2 },
                              { label: 'In Production', step: 3 },
                              { label: 'Completed', step: 4 }
                            ].map((s, idx, arr) => {
                              const isPassed = activeStepIdx >= s.step && activeStepIdx > 0;
                              const isCurrent = activeStepIdx === s.step && activeStepIdx !== 4;
                              const isFullyCompleted = activeStepIdx === 4;

                              return (
                                <React.Fragment key={s.label}>
                                  {/* Step Circle Node */}
                                  <div className="flex flex-col items-center shrink-0 z-10">
                                    <div
                                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-black transition-all border ${isFullyCompleted || (isPassed && !isCurrent)
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/10'
                                        : isCurrent
                                          ? 'bg-violet-600 text-white border-violet-600 shadow-xs ring-2 ring-violet-600/20 animate-pulse'
                                          : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-300 dark:border-zinc-700'
                                        }`}
                                    >
                                      {isFullyCompleted || (isPassed && !isCurrent) ? (
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                      ) : (
                                        <span>{s.step}</span>
                                      )}
                                    </div>

                                    <span
                                      className={`text-[10px] sm:text-[11px] mt-1 font-semibold text-center whitespace-nowrap ${isFullyCompleted
                                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                        : isCurrent
                                          ? 'text-violet-600 dark:text-violet-400 font-bold'
                                          : isPassed
                                            ? 'text-zinc-700 dark:text-zinc-300 font-semibold'
                                            : 'text-zinc-400 dark:text-zinc-500'
                                        }`}
                                    >
                                      {s.label}
                                    </span>
                                  </div>

                                  {/* Segmented Line between adjacent circles - ONLY between steps, NEVER on outer edges! */}
                                  {idx < arr.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-1 sm:mx-2 -mt-4 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${activeStepIdx > s.step ? (isFullyCompleted ? 'bg-emerald-500' : 'bg-violet-600') : 'bg-transparent'
                                          }`}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
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

        {/* TAB 3: Personal Details */}
        {selectedTab === 'account' && (
          <div className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Personal Profile Details
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your personal credentials and contact info.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isEditingProfile) {
                    setEditName(userInfo.name || '');
                    setEditEmail(userInfo.email || '');
                    setEditWhatsapp(userInfo.whatsappNumber || userInfo.contactNumber || '');
                    setEditContact(userInfo.contactNumber || userInfo.whatsappNumber || '');
                  }
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="px-4 py-2 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 hover:bg-violet-100 border border-violet-200 dark:border-violet-800/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {isEditingProfile ? 'Cancel Editing' : 'Edit Details'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfileDetails} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Email Address *</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="tel"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-600/20 flex items-center gap-2"
                  >
                    {isSavingProfile ? <Clock className="h-4 w-4 animate-spin" /> : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-2xl p-4 space-y-1 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Full Name</label>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.name}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(userInfo.name, 'Name')}
                    className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-white transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Copy Name"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-2xl p-4 space-y-1 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Email Address</label>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(userInfo.email, 'Email')}
                    className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-white transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Copy Email"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-2xl p-4 space-y-1 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">WhatsApp Number</label>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.whatsappNumber || userInfo.contactNumber || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(userInfo.whatsappNumber || '', 'WhatsApp')}
                    className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-white transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Copy WhatsApp"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-2xl p-4 space-y-1 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Contact Phone</label>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block mt-0.5">{userInfo.contactNumber || userInfo.whatsappNumber || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(userInfo.contactNumber || '', 'Contact Number')}
                    className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-white transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Copy Phone"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 rounded-2xl p-4 space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Member Since</label>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white block mt-0.5">
                    {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'August 2026'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Shipping Addresses */}
        {selectedTab === 'addresses' && (
          <div className="bg-white dark:bg-[#12131a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Saved Delivery Addresses ({savedAddresses.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your saved addresses for store orders & custom print deliveries.</p>
              </div>

              {!isAddingNewAddress && (
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-violet-600/20"
                >
                  <Plus className="h-3.5 w-3.5" /> + Add New Address
                </button>
              )}
            </div>

            {isAddingNewAddress ? (
              <form onSubmit={handleSaveShippingAddress} className="space-y-4 bg-zinc-50/70 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {editingAddressId ? 'Edit Saved Address' : 'Add New Delivery Address'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddrType('home')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${addrType === 'home'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                    >
                      <Home className="h-3.5 w-3.5" /> Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddrType('work')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${addrType === 'work'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                    >
                      <Building className="h-3.5 w-3.5" /> Work
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Street / Flat / House / Building */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                      Flat, House No., Building, Street Name *
                    </label>
                    <textarea
                      rows={2}
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      required
                      placeholder="e.g. Flat 402, Block A, Green Valley Apartments, MG Road"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 p-3 text-xs outline-none focus:border-violet-500 font-medium leading-relaxed"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      placeholder="e.g. Near City Hospital / Opposite Metro Station"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                      City / District *
                    </label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      required
                      placeholder="e.g. New Delhi"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      required
                      placeholder="e.g. Delhi"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                      Pincode / Postal Code *
                    </label>
                    <input
                      type="text"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      required
                      placeholder="6-digit pincode e.g. 110001"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-600/20 flex items-center gap-2"
                  >
                    {isSavingAddress ? <Clock className="h-4 w-4 animate-spin" /> : editingAddressId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            ) : savedAddresses.length === 0 ? (
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3 bg-zinc-50/40 dark:bg-zinc-900/20">
                <MapPin className="h-8 w-8 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No saved shipping addresses yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Add your primary delivery address for faster checkout!</p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md shadow-violet-600/20"
                >
                  <Plus className="h-3.5 w-3.5" /> + Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-2xl p-5 space-y-3 transition-all ${addr.isDefault
                      ? 'border-violet-300 dark:border-violet-800/80 bg-violet-50/30 dark:bg-violet-950/20 shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">{userInfo.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          {addr.type === 'work' ? <Building className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                          {addr.type || 'home'}
                        </span>
                        {addr.isDefault ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 uppercase">
                            Default Delivery
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] font-bold text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 underline"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit Address
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {addr.street}
                      {addr.landmark ? `, Near ${addr.landmark}` : ''}
                      {addr.city ? `, ${addr.city}` : ''}
                      {addr.state ? `, ${addr.state}` : ''}
                      {addr.pincode ? ` - ${addr.pincode}` : ''}
                    </p>

                    <span className="text-[11px] text-zinc-400 block font-mono">
                      Phone: {userInfo.contactNumber || userInfo.whatsappNumber || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* QUOTE PAYMENT MODAL */}
      {payingQuoteRequest && payingQuoteRequest.quotePrice && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Custom Print Payment</h3>
                  <span className="text-[11px] font-mono text-violet-600 dark:text-violet-400 font-bold">{payingQuoteRequest.requestId}</span>
                </div>
              </div>
              <button
                onClick={() => setPayingQuoteRequest(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quote Summary Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">3D Model File:</span>
                <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px] font-mono">{payingQuoteRequest.fileName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Material &amp; Color:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{payingQuoteRequest.material} ({payingQuoteRequest.color})</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2.5">
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">Total Approved Quote:</span>
                <span className="text-lg font-black text-violet-600 dark:text-violet-400 font-mono">₹{payingQuoteRequest.quotePrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'upi', label: 'Instant UPI / QR', note: 'GPay, PhonePe, Paytm', icon: Zap },
                  { id: 'card', label: 'Credit / Debit Card', note: 'Visa, MasterCard, RuPay', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', note: 'All Indian Banks', icon: Building },
                  { id: 'cod', label: 'Pay on Delivery', note: 'Pay cash/UPI at doorstep', icon: Truck },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = quotePaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setQuotePaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-600 dark:border-violet-500 text-violet-700 dark:text-violet-300 ring-2 ring-violet-600/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'}`} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block">{method.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPayingQuoteRequest(null)}
                className="w-1/3 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingQuotePayment}
                onClick={handleConfirmQuotePayment}
                className="w-2/3 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-violet-600/25 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingQuotePayment ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm &amp; Pay ₹{payingQuoteRequest.quotePrice.toLocaleString()}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Image Preview Overlay Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full bg-zinc-900 rounded-3xl p-3 overflow-hidden shadow-2xl border border-zinc-800" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={previewImage} alt="Reference Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
    </main>
  );
}
