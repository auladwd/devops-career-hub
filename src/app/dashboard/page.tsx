'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StatCards } from '@/components/dashboard/StatCards';
import { Charts } from '@/components/dashboard/Charts';
import { RecentLists } from '@/components/dashboard/RecentLists';
import { DashboardMetrics } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Plus, Briefcase, Terminal, CheckSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        toast.error('ড্যাশবোর্ড মেট্রিক্স লোড করা যায়নি');
      }
    } catch {
      toast.error('সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(nextStatus === 'completed' ? 'টাস্ক সম্পন্ন হয়েছে!' : 'টাস্ক পেন্ডিং করা হয়েছে');
        fetchMetrics();
      }
    } catch {
      toast.error('টাস্ক স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Dashboard Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              DevOps পার্সোনাল ড্যাশবোর্ড
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              আপনার চাকরি আবেদন, হ্যান্ডস-অন ল্যাব প্র্যাকটিস এবং ক্যারিয়ার লক্ষ্যমাত্রার রিয়েল-টাইম তথ্য
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={loading}
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/applications/new">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-xs">
                <Briefcase className="w-4 h-4" />
                <span>নতুন আবেদন</span>
              </Button>
            </Link>
            <Link href="/practice/new">
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>প্র্যাকটিস লগ</span>
              </Button>
            </Link>
            <Link href="/tasks">
              <Button size="sm" variant="outline" className="gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <span>নতুন টাস্ক</span>
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ) : metrics ? (
          <>
            <StatCards metrics={metrics} />
            <Charts metrics={metrics} />
            <RecentLists
              recentApplications={metrics.recentApplications}
              recentPracticeSessions={metrics.recentPracticeSessions}
              todayTasks={metrics.todayTasks}
              upcomingInterviews={metrics.upcomingInterviews}
              onToggleTask={handleToggleTask}
            />
          </>
        ) : (
          <div className="p-12 text-center text-slate-500">
            মেট্রিক্স পাওয়া যায়নি। রিফ্রেশ করার চেষ্টা করুন।
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
