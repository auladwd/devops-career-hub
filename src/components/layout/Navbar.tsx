'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { ThemeToggle } from '../ui/Badge';
import {
  Menu,
  Plus,
  LogOut,
  Briefcase,
  Terminal,
  CheckSquare,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onMenuClick: () => void;
  onOpenQuickAdd?: () => void;
}

export function Navbar({ onMenuClick, onOpenQuickAdd }: NavbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">স্বাগতম,</p>
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
            {user?.displayName || 'DevOps প্র্যাকটিশনার'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Menu */}
        <div className="relative">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন এন্ট্রি</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </Button>

          {quickAddOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickAddOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <Link
                  href="/applications/new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  নতুন জব আবেদন যোগ করুন
                </Link>
                <Link
                  href="/practice/new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  প্র্যাকটিস সেশন রেকর্ড করুন
                </Link>
                <Link
                  href="/tasks"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  নতুন টাস্ক তৈরি করুন
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all"
          >
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Avatar'}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            )}
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.displayName || 'ব্যবহারকারী'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    প্রোফাইল ও সেটিংস
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="w-4 h-4" />
                    লগআউট করুন
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
