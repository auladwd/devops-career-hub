'use client';

import React from 'react';
import { DashboardMetrics } from '@/lib/types';
import { toBengaliNumber } from '@/lib/utils';
import {
  Briefcase,
  Flame,
  Clock,
  CheckCircle,
  HelpCircle,
  Award,
  AlertCircle,
  Target,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../ui/Badge';

interface StatCardsProps {
  metrics: DashboardMetrics;
}

export function StatCards({ metrics }: StatCardsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Job Application Statistics */}
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" /> জব অ্যাপ্লিকেশন পরিসংখ্যান
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-blue-500">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">মোট আবেদন</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {toBengaliNumber(metrics.totalApplications)}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-indigo-500">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">চলমান প্রসেস</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {toBengaliNumber(metrics.inProgressApplications)}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-cyan-500">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">আসন্ন ইন্টারভিউ</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {toBengaliNumber(metrics.upcomingInterviewsCount)}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-emerald-500">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">অফার প্রাপ্ত</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliNumber(metrics.offersReceived)}
              </p>
            </div>
          </Card>
        </div>

        {/* Sub-row for Job details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">এই সপ্তাহে আবেদন:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{toBengaliNumber(metrics.applicationsThisWeek)} টি</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">অ্যাসেসমেন্ট পেন্ডিং:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{toBengaliNumber(metrics.pendingAssessments)} টি</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">ফলো-আপ বাকি:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{toBengaliNumber(metrics.followUpsDueCount)} টি</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">প্রত্যাখ্যাত:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{toBengaliNumber(metrics.rejections)} টি</span>
          </div>
        </div>
      </div>

      {/* 2. DevOps Practice & Goal Statistics */}
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600" /> ডেভঅপ্স প্র্যাকটিস ও লক্ষ্য অগ্রগতি
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-orange-500">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">প্র্যাকটিস স্ট্রিক</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {toBengaliNumber(metrics.currentStreakDays)} <span className="text-xs font-normal text-slate-500">দিন</span>
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-emerald-500">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">মোট প্র্যাকটিস সময়</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {toBengaliNumber(metrics.totalPracticeHours)} <span className="text-xs font-normal text-slate-500">ঘণ্টা</span>
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-purple-500">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">সাপ্তাহিক লক্ষ্য অর্জন</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {toBengaliNumber(metrics.weeklyGoalCompletionPercent)}%
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-l-4 border-l-teal-500">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">রোডম্যাপ সম্পন্ন</p>
              <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                {toBengaliNumber(metrics.roadmapCompletionPercent)}%
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
