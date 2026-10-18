'use client';

import React from 'react';
import { DashboardMetrics } from '@/lib/types';
import { toBengaliNumber } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Badge';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

interface ChartsProps {
  metrics: DashboardMetrics;
}

export function Charts({ metrics }: ChartsProps) {
  const hasAppDistribution = metrics.applicationStatusDistribution.some((item) => item.count > 0);
  const hasPracticeTrend = metrics.weeklyPracticeHoursTrend.some((item) => item.hours > 0);
  const hasSkillProgress = metrics.skillProgressDistribution.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Job Application Status Distribution */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              জব আবেদন স্ট্যাটাস বিতরণ
            </h3>
          </div>
          <span className="text-xs text-slate-500">বর্তমান অবস্থান</span>
        </div>

        <div className="h-64 w-full flex-1 min-h-[240px]">
          {hasAppDistribution ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.applicationStatusDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${toBengaliNumber(val)} টি`, 'সংখ্যা']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">এখনও কোনো আবেদনের ডেটা নেই</p>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Weekly Practice Hours Trend */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              গত ৭ দিনের প্র্যাকটিস সময় (ঘণ্টা)
            </h3>
          </div>
          <span className="text-xs text-slate-500">দৈনিক অনুশীলন</span>
        </div>

        <div className="h-64 w-full flex-1 min-h-[240px]">
          {hasPracticeTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.weeklyPracticeHoursTrend}>
                <defs>
                  <linearGradient id="practiceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${toBengaliNumber(val)} ঘণ্টা`, 'সময়']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#practiceColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">এই সপ্তাহে কোনো প্র্যাকটিস সেশন লগ করা হয়নি</p>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Skill-wise Practice Breakdown */}
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              স্কিল ও টুলস ভিত্তিক প্র্যাকটিস বিতরণ
            </h3>
          </div>
          <span className="text-xs text-slate-500">সর্বাধিক অনুশীলনকৃত বিষয়সমূহ</span>
        </div>

        {hasSkillProgress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.skillProgressDistribution.map((skillItem) => (
              <div
                key={skillItem.skill}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {skillItem.skill}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {toBengaliNumber(skillItem.hours)} ঘণ্টা
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (skillItem.hours / (metrics.totalPracticeHours || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  মোট সেশন: {toBengaliNumber(skillItem.sessions)} টি
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            অনুশীলন সেশন যুক্ত করলে এখানে স্কিল ভিত্তিক বিশ্লেষণ দেখা যাবে
          </div>
        )}
      </Card>
    </div>
  );
}
