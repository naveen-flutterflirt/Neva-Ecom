'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹1,24,800.00',
      change: '+14.2%',
      isPositive: true,
      timeframe: 'vs last month',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Active Orders',
      value: '42 Orders',
      change: '+8.3%',
      isPositive: true,
      timeframe: 'vs last week',
      icon: ShoppingBag,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      title: 'POD Print Requests',
      value: '18 Pending',
      change: '+22.4%',
      isPositive: true,
      timeframe: 'vs yesterday',
      icon: Printer,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Total Customers',
      value: '840 Users',
      change: '-1.5%',
      isPositive: false,
      timeframe: 'vs last month',
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const recentOrders = [
    { id: 'ORD-8921', customer: 'Naveen Kumar', items: 'PLA Filament Red x2', status: 'Confirmed', total: '₹2,499.00', time: '10 mins ago' },
    { id: 'ORD-8920', customer: 'Mansi Sharma', items: 'Custom 3D Action Figure', status: 'In Production', total: '₹5,800.00', time: '1 hour ago' },
    { id: 'ORD-8919', customer: 'Aman Verma', items: 'IoT Starter Kit v2', status: 'Shipped', total: '₹8,999.00', time: '3 hours ago' },
    { id: 'ORD-8918', customer: 'Rahul Sen', items: 'PLA Filament Gray x1', status: 'Delivered', total: '₹1,299.00', time: 'Yesterday' }
  ];

  const pendingPOD = [
    { id: 'REQ-402', modelName: 'Cyberpunk Helmet (V2)', user: 'Shreya Patel', scale: '1:1 Fit', material: 'PETG Matte Black', time: '30 mins ago' },
    { id: 'REQ-401', modelName: 'Raspberry Pi Enclosure', user: 'Vikram Singh', scale: '100% Exact', material: 'PLA Neon Green', time: '4 hours ago' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">Welcome to your administration control console.</p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-zinc-300 transition-all duration-300 hover:translate-y-[-2px] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{stat.value}</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-zinc-450">{stat.timeframe}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Orders List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Recent Catalog Orders</h3>
              <p className="text-xs text-zinc-500">Overview of the latest client checkouts.</p>
            </div>
            <button className="text-xs font-semibold text-violet-600 hover:text-violet-500 flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-all">
                    <td className="py-3 font-semibold text-zinc-900">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3 text-zinc-500 truncate max-w-[180px]">{order.items}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'Shipped' ? 'bg-cyan-50 text-cyan-700' :
                            order.status === 'Confirmed' ? 'bg-violet-50 text-violet-700' :
                              'bg-amber-50 text-amber-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-zinc-900">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Print Pending Requests */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">POD Queue</h3>
              <p className="text-xs text-zinc-500">Pending review model files.</p>
            </div>
            <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 flex items-center gap-1">
              Go to Queue <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {pendingPOD.map((req) => (
              <div
                key={req.id}
                className="group rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">{req.id}</span>
                    <h4 className="text-xs font-bold text-zinc-900 group-hover:text-cyan-600 transition-colors mt-0.5">{req.modelName}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Requested by: <span className="text-zinc-700">{req.user}</span></p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">{req.time}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-150 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Scale: {req.scale}</span>
                  <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5 text-zinc-700">{req.material}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
