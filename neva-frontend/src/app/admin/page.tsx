'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Layers,
  BarChart3,
  Sparkles,
  ShoppingBasket,
  Film,
  UploadCloud
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { apiClient } from '../../lib/api';
import { Skeleton, CardSkeleton, TableSkeletonRows } from '../../components/ui/Skeleton';

interface LiveOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  items: any[];
  createdAt: string;
}

interface LivePODRequest {
  id: string;
  requestId: string;
  customerName: string;
  fileName: string;
  material: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [podRequests, setPodRequests] = useState<LivePODRequest[]>([]);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number>(0);

  // Time Range Filter: Daily | Weekly | Monthly | Yearly
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, podRes, customersRes] = await Promise.all([
        apiClient('/orders').catch(() => ({ success: false, data: [] })),
        apiClient('/custom-print').catch(() => ({ success: false, data: [] })),
        apiClient('/auth/customers').catch(() => ({ success: false, data: [] }))
      ]);

      if (ordersRes && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }
      if (podRes && Array.isArray(podRes.data)) {
        setPodRequests(podRes.data);
      }
      if (customersRes && Array.isArray(customersRes.data)) {
        setTotalCustomersCount(customersRes.data.length);
      }
    } catch (err) {
      console.error('Error loading dashboard live data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculated Real-Time Metrics
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.orderStatus !== 'cancelled') {
      return sum + Number(o.totalAmount || 0);
    }
    return sum;
  }, 0);

  const activeOrdersCount = orders.filter(o =>
    o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  ).length;

  const pendingPodCount = podRequests.filter(r =>
    r.status === 'pending_review' || r.status === 'quote_sent'
  ).length;

  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;
  const inProdCount = orders.filter(o => o.orderStatus === 'in_production').length;
  const confirmedCount = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'pending').length;

  // Real-Time Products / Items Sold Calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    try {
      return new Date(o.createdAt).toISOString().split('T')[0] === todayStr;
    } catch (e) { return false; }
  });

  const todayOrdersCount = todayOrders.length;

  // Today's total products/items quantity sold
  const todayProductsSold = todayOrders.reduce((sum, o) => {
    if (!o.items || !Array.isArray(o.items) || o.items.length === 0) return sum + 1;
    const itemQtySum = o.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0);
    return sum + itemQtySum;
  }, 0);

  // All-time total products/items quantity sold
  const totalProductsSold = orders.reduce((sum, o) => {
    if (!o.items || !Array.isArray(o.items) || o.items.length === 0) return sum + 1;
    const itemQtySum = o.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0);
    return sum + itemQtySum;
  }, 0);

  // Format Items summary helper for table
  const getItemsSummary = (items: any[]) => {
    if (!items || items.length === 0) return 'Store item';
    const first = items[0];
    const rest = items.length - 1;
    return `${first.productName || 'Product'} x${first.quantity || 1}${rest > 0 ? ` +${rest} more` : ''}`;
  };

  // Recent 5 Orders
  const recentOrders = orders.slice(0, 5);
  // Recent 3 POD Queue Requests
  const recentPodQueue = podRequests.slice(0, 3);

  // Real-Time 100% Dynamic Chart Aggregator from Live DB Orders
  const getChartData = () => {
    const parseOrderDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const getLocalYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (timeRange === 'daily') {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
      const distanceToMon = (dayOfWeek + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMon);

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayBuckets: { [key: string]: { label: string; revenue: number; orders: number } } = {};

      daysOfWeek.forEach((dayName, idx) => {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
        const ymd = getLocalYMD(d);
        dayBuckets[ymd] = {
          label: `${dayName} (${d.getDate()}/${d.getMonth() + 1})`,
          revenue: 0,
          orders: 0
        };
      });

      orders.forEach(o => {
        if (o.orderStatus === 'cancelled') return;
        const d = parseOrderDate(o.createdAt);
        const ymd = getLocalYMD(d);
        const rev = Number(o.totalAmount || 0);
        const itemQty = Array.isArray(o.items) && o.items.length > 0
          ? o.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
          : 1;

        if (dayBuckets[ymd]) {
          dayBuckets[ymd].revenue += rev;
          dayBuckets[ymd].orders += itemQty;
        }
      });

      return Object.values(dayBuckets);
    } else if (timeRange === 'weekly') {
      const now = new Date();
      const weekBuckets = [
        { label: 'Week 1', revenue: 0, orders: 0 },
        { label: 'Week 2', revenue: 0, orders: 0 },
        { label: 'Week 3', revenue: 0, orders: 0 },
        { label: 'Week 4', revenue: 0, orders: 0 }
      ];

      orders.forEach(o => {
        if (o.orderStatus === 'cancelled') return;
        const d = parseOrderDate(o.createdAt);
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
        let weekIdx = 3 - Math.floor(diffDays / 7);
        if (weekIdx < 0) weekIdx = 0;
        if (weekIdx > 3) weekIdx = 3;

        const rev = Number(o.totalAmount || 0);
        const itemQty = Array.isArray(o.items) && o.items.length > 0
          ? o.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
          : 1;

        weekBuckets[weekIdx].revenue += rev;
        weekBuckets[weekIdx].orders += itemQty;
      });

      return weekBuckets;
    } else if (timeRange === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const last6Months: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push(monthNames[d.getMonth()]);
      }

      const buckets = last6Months.map(m => ({ label: m, revenue: 0, orders: 0 }));

      orders.forEach(o => {
        if (o.orderStatus === 'cancelled') return;
        const d = parseOrderDate(o.createdAt);
        const mName = monthNames[d.getMonth()];
        const bucket = buckets.find(b => b.label === mName);
        if (bucket) {
          const rev = Number(o.totalAmount || 0);
          const itemQty = Array.isArray(o.items) && o.items.length > 0
            ? o.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
            : 1;

          bucket.revenue += rev;
          bucket.orders += itemQty;
        }
      });

      return buckets;
    } else {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear];
      const yearBuckets: { [key: number]: { revenue: number; orders: number } } = {};
      years.forEach(y => { yearBuckets[y] = { revenue: 0, orders: 0 }; });

      orders.forEach(o => {
        if (o.orderStatus === 'cancelled') return;
        const d = parseOrderDate(o.createdAt);
        const y = d.getFullYear();
        if (yearBuckets[y]) {
          const rev = Number(o.totalAmount || 0);
          const itemQty = Array.isArray(o.items) && o.items.length > 0
            ? o.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
            : 1;

          yearBuckets[y].revenue += rev;
          yearBuckets[y].orders += itemQty;
        }
      });

      return years.map(y => ({
        label: `${y}`,
        revenue: yearBuckets[y].revenue,
        orders: yearBuckets[y].orders
      }));
    }
  };

  const chartData = getChartData();

  // Clean Light Glassmorphic Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revVal = payload.find((p: any) => p.dataKey === 'revenue')?.value;
      const orderVal = payload.find((p: any) => p.dataKey === 'orders')?.value;

      return (
        <div className="bg-white/95 text-zinc-900 border border-zinc-200/90 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
            <span className="font-extrabold text-violet-700 uppercase tracking-wider text-[10px]">{label} Analytics</span>
            <Sparkles className="h-3 w-3 text-violet-600" />
          </div>
          {revVal !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-violet-600 shadow-xs" />
                Revenue:
              </span>
              <span className="font-extrabold text-zinc-900 font-mono text-xs">₹{Number(revVal).toLocaleString('en-IN')}</span>
            </div>
          )}
          {orderVal !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-xs" />
                Products Sold:
              </span>
              <span className="font-extrabold text-cyan-700 font-mono text-xs">{orderVal} items</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Live operational overview, financial metrics & database analytics.</p>
        </div>
      </div>

      {/* Real Analytics Cards Grid with Skeleton Loaders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total Revenue Card */}
            <div className="group rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-violet-300 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Revenue</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-mono">
                  ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700">
                    <ArrowUpRight className="h-3 w-3" />
                    Live Sales
                  </span>
                  <span className="text-xs text-zinc-400">Total gross value</span>
                </div>
              </div>
            </div>

            {/* Real Products Sold & Orders Card */}
            <div className="group rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-violet-300 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Products Sold</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-110">
                  <ShoppingBasket className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                  {todayProductsSold > 0 ? todayProductsSold : totalProductsSold}{' '}
                  <span className="text-xs font-semibold text-zinc-500">
                    {todayProductsSold > 0 ? 'Items Sold Today' : 'Items Purchased'}
                  </span>
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold bg-violet-50 text-violet-700">
                    {todayOrdersCount > 0 ? `${todayOrdersCount} Orders Today` : `${orders.length} Total Orders`}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    ({activeOrdersCount} In Pipeline)
                  </span>
                </div>
              </div>
            </div>

            {/* POD Print Requests Card */}
            <div className="group rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-violet-300 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">POD Queue</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-transform group-hover:scale-110">
                  <Printer className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                  {pendingPodCount} <span className="text-sm font-semibold text-zinc-400">Pending Quotes</span>
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold bg-cyan-50 text-cyan-700">
                    Total Tickets: {podRequests.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Customers Card */}
            <div className="group rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-violet-300 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Customers</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                  {totalCustomersCount} <span className="text-sm font-semibold text-zinc-400">Registered</span>
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700">
                    Verified Users
                  </span>
                </div>
              </div>
            </div>

            {/* AWS S3 Social Proof Videos Quick Action Card */}
            <Link
              href="/admin/social-proof"
              className="group rounded-2xl border border-pink-200/80 bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-6 hover:border-pink-300 transition-all duration-300 shadow-xs hover:shadow-md block cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-pink-700 uppercase tracking-wider">Social Proof Videos</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 text-white transition-transform group-hover:scale-110 shadow-md">
                  <Film className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-lg font-black tracking-tight text-zinc-900 flex items-center gap-1.5 group-hover:text-pink-600 transition-colors">
                  Upload S3 Videos <ChevronRight className="h-4 w-4 text-pink-600 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold bg-pink-100 text-pink-700">
                    <UploadCloud className="h-3 w-3" /> AWS S3 Direct Upload
                  </span>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Stripe/Vercel-Grade Dual Smooth Area Spline Chart with Segmented Time Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modern Interactive Revenue & Orders Dual Spline Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                Sales & Products Sold Analytics
              </h3>
              <p className="text-xs text-zinc-500">Live tracking for sales revenue (₹) & products/items sold count</p>
            </div>

            {/* Segmented Switch Time Range Filter */}
            <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 self-start sm:self-auto">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimeRange(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${timeRange === mode
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                    : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Badges Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-1 text-xs border-b border-zinc-100 font-semibold">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-500" />
                <span className="text-zinc-500">Revenue:</span>
                <span className="font-extrabold text-zinc-900 font-mono">₹{chartData.reduce((s, c) => s + c.revenue, 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                <span className="text-zinc-500">Products Sold:</span>
                <span className="font-extrabold text-zinc-900 font-mono">{chartData.reduce((s, c) => s + c.orders, 0)} items</span>
              </div>
            </div>
          </div>

          {/* Recharts Composed Area Splines (Dual Y-Axis) */}
          <div className="h-64 w-full pt-2">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f4f4f5" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }}
                  />
                  {/* Left Y-Axis for Revenue ₹ */}
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#7c3aed', fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  {/* Right Y-Axis for Products Sold Count */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#0891b2', fontWeight: 600 }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  {/* Products Sold Volume Smooth Area Spline */}
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="Products Sold (Items)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrdersGrad)"
                  />
                  {/* Revenue Amount Smooth Area Spline */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue Amount (₹)"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenueGrad)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Breakdown Progress Metrics */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Order Pipeline Breakdown
            </h3>
            <p className="text-xs text-zinc-500">Live order fulfillment status percentage</p>
          </div>

          <div className="space-y-4 pt-2">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-700">Confirmed / Processing</span>
                    <span className="text-violet-600 font-mono">{confirmedCount} orders</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${orders.length ? Math.round((confirmedCount / orders.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-700">In Production / Printing</span>
                    <span className="text-indigo-600 font-mono">{inProdCount} orders</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${orders.length ? Math.round((inProdCount / orders.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-700">Delivered Successfully</span>
                    <span className="text-emerald-600 font-mono">{deliveredCount} orders</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${orders.length ? Math.round((deliveredCount / orders.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content - Recent Orders & POD Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Recent Store Orders</h3>
              <p className="text-xs text-zinc-500">Live feed of latest customer order checkouts</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-violet-600 hover:text-violet-500 flex items-center gap-1 cursor-pointer bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100 transition"
            >
              View All Orders <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items Purchased</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {isLoading ? (
                  <TableSkeletonRows rows={5} cols={5} />
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                      No live orders found in the database.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-violet-700 text-xs whitespace-nowrap">
                        {order.orderNumber || order.id}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900">{order.customerName || 'Customer'}</span>
                          <span className="text-[10px] text-zinc-400">{order.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-zinc-700 font-medium truncate max-w-[200px] block">
                          {getItemsSummary(order.items)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          order.orderStatus === 'shipped' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                            order.orderStatus === 'in_production' ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                          {order.orderStatus || 'confirmed'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-zinc-900 font-mono whitespace-nowrap">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Print Pending Requests */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">POD Queue</h3>
              <p className="text-xs text-zinc-500">Live 3D print request tickets</p>
            </div>
            <Link
              href="/admin/custom-print"
              className="text-xs font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 cursor-pointer bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-100 transition"
            >
              Go to Queue <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : recentPodQueue.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                No custom print requests pending.
              </div>
            ) : (
              recentPodQueue.map((req) => (
                <div
                  key={req.id}
                  className="group rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 hover:border-cyan-300 hover:bg-cyan-50/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100 uppercase tracking-wider">{req.requestId || req.id}</span>
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-cyan-600 transition-colors mt-1.5">{req.fileName}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Requested by: <span className="font-semibold text-zinc-700">{req.customerName}</span></p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-150 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-semibold text-zinc-600">Material: {req.material}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      req.status === 'quote_sent' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
