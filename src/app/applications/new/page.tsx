'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { Briefcase } from 'lucide-react';

export default function NewApplicationPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600" /> নতুন জব আবেদন যুক্ত করুন
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            কোম্পানির তথ্য, চাকরির শর্তাবলী ও আবেদনের স্ট্যাটাস পূরণ করে ট্র্যাকিং শুরু করুন
          </p>
        </div>

        <ApplicationForm />
      </div>
    </DashboardShell>
  );
}
