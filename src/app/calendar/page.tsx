'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TaskItem, InterviewSession, PracticeSession } from '@/lib/types';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [todayStr, setTodayStr] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [tasksRes, interviewsRes] = await Promise.all([
        fetch('/api/tasks?view=all'),
        fetch('/api/interviews/sessions'),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (interviewsRes.ok) setInterviews(await interviewsRes.json());
    } catch {
      toast.error('ক্যালেন্ডার ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setTodayStr(now.toISOString().split('T')[0]);
    fetchCalendarData();
  }, []);

  const now = currentDate || new Date(2026, 9, 1);
  const year = now.getFullYear();
  const month = now.getMonth();

  const BENGALI_MONTHS = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];

  const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  // Calculate days for the calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <CalendarDays className="w-7 h-7 text-blue-600" /> ক্যারিয়ার ও শিডিউল ক্যালেন্ডার
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ইন্টারভিউ ডেট, টাস্ক ডেডলাইন এবং প্র্যাকটিস প্ল্যানিং (Asia/Dhaka টাইমজোন)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 px-3">
              {BENGALI_MONTHS[month]} {toBengaliNumber(year)}
            </span>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="p-4 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            {DAYS_BN.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {/* Blank cells before day 1 */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] bg-slate-50/50 dark:bg-slate-950/20 rounded-lg p-1.5" />
            ))}

            {/* Days in month */}
            {[...Array(totalDaysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;

              // Filter events on this date
              const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
              const dayInterviews = interviews.filter((item) => item.interviewDate.startsWith(dateStr));

              return (
                <div
                  key={dayNum}
                  className={`min-h-[100px] border rounded-lg p-1.5 flex flex-col justify-between transition-all ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 font-bold'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {toBengaliNumber(dayNum)}
                    </span>
                    {(dayTasks.length > 0 || dayInterviews.length > 0) && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px]">
                    {dayInterviews.map((item) => (
                      <div
                        key={item.id || item._id}
                        title={`ইন্টারভিউ: ${item.companyName} (${item.role})`}
                        className="p-1 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] truncate border border-purple-200 dark:border-purple-800 flex items-center gap-1"
                      >
                        <HelpCircle className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{item.companyName}</span>
                      </div>
                    ))}

                    {dayTasks.map((t) => (
                      <div
                        key={t.id || t._id}
                        title={`টাস্ক: ${t.title}`}
                        className={`p-1 rounded text-[10px] truncate flex items-center gap-1 ${
                          t.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
