'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardMetrics } from '@/lib/types';
import { toBengaliNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Badge';
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        setMetrics(await res.json());
      }
    } catch {
      toast.error('অ্যানালিটিক্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#64748b'];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-blue-600" /> ক্যারিয়ার অ্যানালিটিক্স ও ডাটা এক্সপোর্ট
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              বাস্তব ডেটাবেস তথ্যের ওপর ভিত্তি করে সামগ্রিক অগ্রগতি ও পার্সোনাল ডাটা ব্যাকআপ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/api/applications/export" download>
              <Button size="sm" variant="outline" className="gap-1.5 shadow-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>জব আবেদন CSV</span>
              </Button>
            </a>
            <a href="/api/reports/export?format=json" download>
              <Button size="sm" variant="primary" className="gap-1.5 shadow-xs">
                <FileCode className="w-4 h-4" />
                <span>সম্পূর্ণ ডাটা JSON ব্যাকআপ</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Security & Isolation Notice */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            এক্সপোর্ট ফাইলগুলো সরাসরি সার্ভার থেকে আপনার ব্যক্তিগত ইউজার আইডির (Firebase UID) তথ্য ফিল্টার করে তৈরি করা হয়।
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            অ্যানালিটিক্স লোড হচ্ছে...
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Top Summaries */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <span className="text-xs text-slate-400 font-medium">মোট জব আবেদন</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {toBengaliNumber(metrics.totalApplications)}
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">
                  এই মাসে: {toBengaliNumber(metrics.applicationsThisMonth)} টি
                </span>
              </Card>

              <Card className="p-4">
                <span className="text-xs text-slate-400 font-medium">অফার প্রাপ্তির হার</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics.totalApplications > 0
                    ? `${toBengaliNumber(Math.round((metrics.offersReceived / metrics.totalApplications) * 100))}%`
                    : '০%'}
                </p>
                <span className="text-[11px] text-slate-400">
                  মোট অফার: {toBengaliNumber(metrics.offersReceived)} টি
                </span>
              </Card>

              <Card className="p-4">
                <span className="text-xs text-slate-400 font-medium">মোট প্র্যাকটিস সময়</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {toBengaliNumber(metrics.totalPracticeHours)} ঘণ্টা
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  সেশন: {toBengaliNumber(metrics.totalPracticeSessions)} টি
                </span>
              </Card>

              <Card className="p-4">
                <span className="text-xs text-slate-400 font-medium">রোডম্যাপ পূর্ণতা</span>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {toBengaliNumber(metrics.roadmapCompletionPercent)}%
                </p>
                <span className="text-[11px] text-slate-400">
                  স্ট্রিক: {toBengaliNumber(metrics.currentStreakDays)} দিন
                </span>
              </Card>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Status Chart */}
              <Card className="p-5 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" /> জব আবেদন স্ট্যাটাস অনুপাত
                </h3>
                <div className="h-64 w-full">
                  {metrics.applicationStatusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.applicationStatusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(v: any) => [`${toBengaliNumber(v)} টি`, 'সংখ্যা']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      কোনো আবেদন নেই
                    </div>
                  )}
                </div>
              </Card>

              {/* Skills Breakdown */}
              <Card className="p-5 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" /> সর্বাধিক প্র্যাকটিসকৃত স্কিল
                </h3>
                <div className="h-64 w-full">
                  {metrics.skillProgressDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.skillProgressDistribution}
                          dataKey="hours"
                          nameKey="skill"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name }) => name}
                        >
                          {metrics.skillProgressDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`${toBengaliNumber(v)} ঘণ্টা`, 'সময়']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      কোনো প্র্যাকটিস সেশন লগ করা হয়নি
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
