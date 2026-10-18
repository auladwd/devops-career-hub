'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { UserPreferences, ApplicationStatus } from '@/lib/types';
import { APPLICATION_STATUS_LABELS } from '@/lib/constants/bengali';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import {
  Settings,
  User,
  Clock,
  Target,
  Sun,
  Moon,
  Trash2,
  Save,
  AlertTriangle,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        setPreferences(await res.json());
      }
    } catch {
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        toast.success('সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('নিশ্চিত করতে "DELETE" টাইপ করুন');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (res.ok) {
        toast.success('আপনার অ্যাকাউন্ট ও সকল ডেটা স্থায়ীভাবে মুছে ফেলা হয়েছে');
        await logout();
        router.push('/');
      } else {
        toast.error('অ্যাকাউন্ট মুছতে ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-blue-600" /> প্রোফাইল ও ব্যক্তিগত পছন্দসমূহ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            দৈনিক লক্ষ্যমাত্রা, সময় অঞ্চল, থিম প্রেফারেন্স ও অ্যাকাউন্ট ব্যবস্থাপনা
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">সেটিংস লোড হচ্ছে...</div>
        ) : preferences ? (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. Profile Information */}
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> প্রোফাইল তথ্য
              </h2>

              <div className="flex items-center gap-4 py-2">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-16 h-16 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 text-xl font-bold flex items-center justify-center">
                    {user?.displayName?.charAt(0) || 'D'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {user?.displayName || 'DevOps Engineer'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    UID: {user?.uid}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="প্রদর্শনের নাম (Display Name)"
                  required
                  value={preferences.displayName}
                  onChange={(e) => setPreferences({ ...preferences, displayName: e.target.value })}
                />
                <Input
                  label="সময় অঞ্চল (Timezone)"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  helperText="ডিফল্ট: Asia/Dhaka"
                />
              </div>
            </Card>

            {/* 2. Practice Goals & Preferences */}
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" /> ক্যারিয়ার ও প্র্যাকটিস লক্ষ্যমাত্রা
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="দৈনিক প্র্যাকটিস লক্ষ্য (মিনিট)"
                  min={10}
                  max={720}
                  value={preferences.dailyPracticeGoalMinutes}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      dailyPracticeGoalMinutes: parseInt(e.target.value, 10) || 60,
                    })
                  }
                  helperText="প্রস্তাবিত: ৬০ মিনিট"
                />

                <Input
                  type="number"
                  label="সাপ্তাহিক প্র্যাকটিস লক্ষ্য (ঘণ্টা)"
                  min={1}
                  max={80}
                  value={preferences.weeklyPracticeGoalHours}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weeklyPracticeGoalHours: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  helperText="প্রস্তাবিত: ১০ ঘণ্টা"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="ডিফল্ট জব আবেদন স্ট্যাটাস"
                  value={preferences.defaultApplicationStatus}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      defaultApplicationStatus: e.target.value as ApplicationStatus,
                    })
                  }
                >
                  {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    থিম পছন্দ
                  </label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          theme === t
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t === 'light' ? 'লাইট' : t === 'dark' ? 'ডার্ক' : 'সিস্টেম'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md" isLoading={saving} className="gap-2">
                  <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
                </Button>
              </div>
            </Card>

            {/* 3. Data Export & Account Deletion (Danger Zone) */}
            <Card className="p-5 border-rose-200 dark:border-rose-900/60 bg-rose-50/20 space-y-4">
              <h2 className="text-base font-bold text-rose-700 dark:text-rose-400 border-b border-rose-200 dark:border-rose-900/50 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> বিপজ্জনক অঞ্চল ও ডেটা রিমুভাল
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                আপনার অ্যাকাউন্ট মুছে ফেললে আপনার সকল জব আবেদন, প্র্যাকটিস সেশন, রোডম্যাপ, নোট, টাস্ক এবং ক্লাউডিনারি ফাইল স্থায়ীভাবে মুছে যাবে। এটি কখনো পুনরুদ্ধারযোগ্য নয়।
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <a href="/api/reports/export?format=json" download>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> মোছার আগে ব্যাকআপ নিন
                  </Button>
                </a>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলুন
                </Button>
              </div>
            </Card>
          </form>
        ) : null}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="স্থায়ী অ্যাকাউন্ট মুছে ফেলার নিশ্চয়তা"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">সতর্কতা: এই প্রক্রিয়াটি সম্পূর্ণ অপরিবর্তনীয়!</p>
                <p className="mt-1">
                  আপনার ইউজারের অধীনে থাকা সমস্ত জব আবেদন, সিভি ফাইল ও ডেটাবেস ডকুমেন্ট চিরতরে ডিলিট করা হবে।
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                নিশ্চিত করতে নিচের ঘরে বড় হাতের অক্ষরে <span className="font-mono text-rose-600 font-bold">DELETE</span> টাইপ করুন:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingAccount}
              >
                বাতিল
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteAccountConfirm}
                isLoading={isDeletingAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                স্থায়ীভাবে ডিলিট করুন
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
