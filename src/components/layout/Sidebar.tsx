'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  Terminal,
  Map,
  CheckSquare,
  CalendarDays,
  HelpCircle,
  FileText,
  Bookmark,
  FolderLock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const navItems = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/applications', label: 'জব ট্র্যাকার', icon: Briefcase },
  { href: '/practice', label: 'ডেভঅপ্স প্র্যাকটিস', icon: Terminal },
  { href: '/roadmap', label: 'লার্নিং রোডম্যাপ', icon: Map },
  { href: '/tasks', label: 'টাস্ক ম্যানেজমেন্ট', icon: CheckSquare },
  { href: '/calendar', label: 'ক্যালেন্ডার', icon: CalendarDays },
  { href: '/interviews', label: 'ইন্টারভিউ প্রস্তুতি', icon: HelpCircle },
  { href: '/notes', label: 'ব্যক্তিগত নোটস', icon: FileText },
  { href: '/resources', label: 'রিসোর্স লাইব্রেরি', icon: Bookmark },
  { href: '/documents', label: 'সিভি ও ডকুমেন্টস', icon: FolderLock },
  { href: '/reports', label: 'রিপোর্ট ও অ্যানালিটিক্স', icon: BarChart3 },
  { href: '/settings', label: 'প্রোফাইল ও সেটিংস', icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out',
          // Desktop collapsing width
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile responsive slide-in
          mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo and Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight transition-opacity duration-200">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight block">
                  DevOps Career
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Hub (বাংলা)</span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'প্রসারিত করুন' : 'সংকুচিত করুন'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Tooltip on collapsed state */}
                {collapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Security badge footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs',
              collapsed && 'justify-center px-0'
            )}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            {!collapsed && <span className="truncate">নিরাপদ ও আইসোলেটেড ডেটা</span>}
          </div>
        </div>
      </aside>
    </>
  );
}
