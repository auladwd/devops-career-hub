'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PracticeSession } from '@/lib/types';
import {
  DEVOPS_PRACTICE_CATEGORIES,
  PRACTICE_DIFFICULTY_LABELS,
  PRACTICE_STATUS_LABELS,
} from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Terminal,
  Plus,
  Flame,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  GitBranch,
  Star,
  CheckCircle,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PracticePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPracticeData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: categoryFilter,
        difficulty: difficultyFilter,
        search,
        limit: '50',
      });

      const res = await fetch(`/api/practice?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.items || []);
        setMetrics(data.metrics || null);
      }
    } catch {
      toast.error('প্র্যাকটিস ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPracticeData();
  };

  const handleRepeatExercise = (session: PracticeSession) => {
    // Navigate to new form with prepopulated title, category, and skill
    const query = new URLSearchParams({
      repeatTitle: session.title,
      repeatCategory: session.category,
      repeatSkill: session.skill,
    });
    router.push(`/practice/new?${query.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/practice/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('সেশন সফলভাবে মুছে ফেলা হয়েছে');
        setDeleteId(null);
        fetchPracticeData();
      } else {
        toast.error('মুছতে ব্যর্থ');
      }
    } catch {
      toast.error('সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate last 28 days for activity heatmap inside useEffect
  const [heatmapDays, setHeatmapDays] = useState<{ date: string; minutes: number }[]>([]);

  useEffect(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = metrics?.recentHeatmap?.[dateStr] || 0;
      days.push({ date: dateStr, minutes });
    }
    setHeatmapDays(days);
  }, [metrics]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Terminal className="w-7 h-7 text-emerald-600" /> ডেভঅপ্স প্র্যাকটিস ট্র্যাকার
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              হ্যান্ডস-অন ল্যাব, কোড স্নিপেট, ফেস করা সমস্যা ও ধারাবাহিক স্ট্রিক মনিটর করুন
            </p>
          </div>

          <Link href="/practice/new">
            <Button size="sm" variant="primary" className="gap-1.5 shadow-xs">
              <Plus className="w-4 h-4" /> নতুন সেশন লগ করুন
            </Button>
          </Link>
        </div>

        {/* Practice Metrics & Heatmap Card */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4 p-5 border-l-4 border-l-orange-500">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">বর্তমান ধারাবাহিকতা (Streak)</span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {toBengaliNumber(metrics.currentStreakDays)} দিন
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 border-l-4 border-l-emerald-500">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">এই সপ্তাহের মোট সময়</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {toBengaliNumber(metrics.hoursThisWeek)} ঘণ্টা
                </span>
                <span className="text-[11px] text-slate-400 block">
                  মোট সেশন: {toBengaliNumber(metrics.totalSessions)} টি ({toBengaliNumber(metrics.totalHours)} ঘণ্টা)
                </span>
              </div>
            </Card>

            {/* 28-day Activity Heatmap */}
            <Card className="p-4 flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                গত ২৮ দিনের প্র্যাকটিস ক্যালেন্ডার
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapDays.map((d) => {
                  let bg = 'bg-slate-200 dark:bg-slate-800';
                  if (d.minutes > 90) bg = 'bg-emerald-600';
                  else if (d.minutes > 45) bg = 'bg-emerald-500';
                  else if (d.minutes > 0) bg = 'bg-emerald-300 dark:bg-emerald-700';

                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${toBengaliNumber(d.minutes)} মিনিট`}
                      className={`h-4 rounded-xs ${bg} transition-colors hover:ring-2 hover:ring-blue-400 cursor-pointer`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>২৮ দিন আগে</span>
                <span>আজ</span>
              </div>
            </Card>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="শিরোনাম বা স্কিল খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {DEVOPS_PRACTICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">সকল মাত্রা (Difficulty)</option>
                {Object.entries(PRACTICE_DIFFICULTY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <Button type="submit" size="sm" variant="secondary" className="shrink-0">
                ফিল্টার
              </Button>
            </div>
          </form>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            প্র্যাকটিস সেশন লোড হচ্ছে...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Terminal className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো প্র্যাকটিস সেশন পাওয়া যায়নি
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              আজকে যা শিখলেন বা ল্যাব করলেন তা লিখে রাখুন।
            </p>
            <Link href="/practice/new">
              <Button size="md" variant="primary">
                প্রথম সেশন রেকর্ড করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card
                key={session.id || session._id}
                className="hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {session.category}
                      </span>
                      <span>•</span>
                      <span>{session.skill}</span>
                      <span>•</span>
                      <span>{formatBengaliDate(session.practiceDate)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge size="sm" variant="info">
                      {PRACTICE_DIFFICULTY_LABELS[session.difficulty]?.split(' ')[0]}
                    </Badge>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {toBengaliNumber(session.durationMinutes)} মিনিট
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <p className="whitespace-pre-line">{session.whatPracticed}</p>

                  {session.codeSnippets && (
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1 font-sans">
                        <Code2 className="w-3.5 h-3.5" /> ব্যবহৃত কমান্ড বা কোড:
                      </div>
                      <code>{session.codeSnippets}</code>
                    </div>
                  )}

                  {(session.problemsFaced || session.solutionsLearned) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {session.problemsFaced && (
                        <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                          <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
                            সমস্যা:
                          </span>
                          <span>{session.problemsFaced}</span>
                        </div>
                      )}
                      {session.solutionsLearned && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                            সমাধান ও শিক্ষা:
                          </span>
                          <span>{session.solutionsLearned}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions: Repeat exercise, github link, delete */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    {session.githubUrl && (
                      <a
                        href={session.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
                      >
                        <GitBranch className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {session.projectUrl && (
                      <a
                        href={session.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> লাইভ লিঙ্ক
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRepeatExercise(session)}
                      className="gap-1.5 text-xs py-1"
                      title="এই অনুশীলনটি ভিত্তি করে নতুন সেশন তৈরি করুন"
                    >
                      <RotateCcw className="w-3 h-3 text-blue-500" /> পুনরায় প্র্যাকটিস
                    </Button>
                    <button
                      onClick={() => setDeleteId(session.id || session._id!)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="প্র্যাকটিস সেশন মোছার নিশ্চয়তা"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-semibold">
                আপনি কি নিশ্চিত যে এই প্র্যাকটিস সেশনটি মুছে ফেলতে চান?
              </p>
            </div>
            <p className="text-xs text-slate-500">
              এটি মোছার পর ড্যাশবোর্ডের মোট ঘণ্টা ও স্ট্রিক পুনর্গণনা করা হবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                বাতিল করুন
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
