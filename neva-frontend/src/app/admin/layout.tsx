'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FolderTree,
  Tags,
  Image as ImageIcon,
  Boxes,
  FileText,
  Clock,
  DollarSign,
  Hammer,
  ShoppingBag,
  ListOrdered,
  AlertCircle,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  CreditCard,
  Check,
  X,
  RefreshCw,
  Users,
  ChevronDown,
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Film,
  Sparkles
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Catalog': true,
    'Custom Print / POD': true,
    'Orders': true,
    'Payments': true,
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('neva-admin-token') || localStorage.getItem('neva-token')) : null;
    const userStr = typeof window !== 'undefined' ? (localStorage.getItem('neva-admin-user') || localStorage.getItem('neva-user')) : null;

    if (!token) {
      router.push('/admin-login');
      return;
    }

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role !== 'admin') {
          router.push('/admin-login');
          return;
        }
      } catch (e) { }
    }

    setAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neva-admin-token');
      localStorage.removeItem('neva-admin-user');
    }
    router.push('/admin-login');
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const menuGroups: SidebarGroup[] = [
    {
      title: 'Catalog',
      icon: FolderTree,
      items: [
        { name: 'Categories', href: '/admin/catalog/categories', icon: Tags },
        { name: 'Products', href: '/admin/catalog/products', icon: Boxes },

      ],
    },
    {
      title: 'Custom Print / POD',
      icon: Hammer,
      items: [
        { name: 'Print Requests', href: '/admin/custom-print', icon: FileText },
      ],
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      items: [
        { name: 'All Orders', href: '/admin/orders', icon: ListOrdered },
      ],
    },
    {
      title: 'Payments',
      icon: CreditCard,
      items: [
        { name: 'All Payments', href: '/admin/payments', icon: CheckCircle },
      ],
    },
    {
      title: 'Social Media',
      icon: Sparkles,
      items: [
        { name: 'Social Proof Videos', href: '/admin/social-proof', icon: Film }
      ]
    }
  ];

  const handleMobileLinkClick = () => {
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-zinc-200 text-zinc-700">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-[0_4px_12px_rgba(124,58,237,0.2)]">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-wider text-zinc-900">NIVA ADMIN</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden text-zinc-500 hover:text-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200">
        {/* Dashboard Link */}
        <div>
          <Link
            href="/admin"
            onClick={handleMobileLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/admin'
              ? 'bg-violet-50 text-violet-700 border border-violet-100'
              : 'hover:bg-zinc-50 hover:text-zinc-900 border border-transparent'
              }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard Overview</span>
          </Link>
        </div>

        {/* Dynamic Groups */}
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups[group.title];
          const GroupIcon = group.icon;
          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="h-3.5 w-3.5" />
                  <span>{group.title}</span>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
              </button>

              {isExpanded && (
                <div className="pl-3 mt-1 space-y-0.5 border-l border-zinc-100 ml-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleMobileLinkClick}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                          ? 'bg-violet-50/70 text-violet-700 font-semibold'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-550'
                          }`}
                      >
                        <ItemIcon className={`h-3.5 w-3.5 ${isActive ? 'text-violet-600' : 'text-zinc-400'}`} />
                        <span>{item.name}</span>
                        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-600" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Direct Links */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            User Base
          </div>
          <Link
            href="/admin/customers"
            onClick={handleMobileLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/customers'
              ? 'bg-violet-50 text-violet-700 border border-violet-100'
              : 'hover:bg-zinc-50 hover:text-zinc-900 border border-transparent'
              }`}
          >
            <Users className="h-4.5 w-4.5 text-zinc-400" />
            <span>Customers</span>
          </Link>
        </div>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-violet-700">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-950 truncate">Administrator</p>
            <p className="text-[10px] text-zinc-400 truncate">admin@NIVASHOP</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex bg-zinc-50 text-zinc-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <div className="h-full w-64 overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile & Tablet Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/30 backdrop-blur-sm">
          <div className="w-64 h-full shrink-0">
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Sidebar Toggle Float */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-850 shadow-sm transition-all hover:bg-zinc-50"
              title="Open Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-850 shadow-sm transition-all hover:bg-zinc-50"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 sm:p-8 relative">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
