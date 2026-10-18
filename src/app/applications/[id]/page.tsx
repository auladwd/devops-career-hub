'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { JobApplication, InterviewSession } from '@/lib/types';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import {
  APPLICATION_STATUS_LABELS,
  WORK_ARRANGEMENT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  JOB_SOURCE_LABELS,
} from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  ArrowLeft,
  Building,
  Globe,
  MapPin,
  Calendar,
  Clock,
  History,
  FileText,
  UserCheck,
  Edit,
  ExternalLink,
  Tag,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function ApplicationDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const [appRes, interviewRes] = await Promise.all([
        fetch(`/api/applications/${id}`),
        fetch(`/api/interviews/sessions?applicationId=${id}`),
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setApplication(appData);
      } else {
        toast.error('আবেদনটি খুঁজে পাওয়া যায়নি');
      }

      if (interviewRes.ok) {
        const interviewData = await interviewRes.json();
        setInterviews(interviewData || []);
      }
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="p-12 text-center text-slate-500 animate-pulse">
          আবেদনের বিস্তারিত তথ্য লোড হচ্ছে...
        </div>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell>
        <div className="max-w-lg mx-auto text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold">আবেদনটি পাওয়া যায়নি</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            এটি মুছে ফেলা হয়ে থাকতে পারে বা আপনার অনুমতি নেই।
          </p>
          <Link href="/applications">
            <Button size="sm">আবেদনের তালিকায় ফিরুন</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/applications">
              <Button size="sm" variant="outline" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {application.position}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {application.company}
                </span>
                {application.location && <span>• {application.location}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'details' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('details')}
            >
              বিস্তারিত ও হিস্ট্রি
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'edit' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('edit')}
              className="gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" /> এডিট করুন
            </Button>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <ApplicationForm initialData={application} isEditing={true} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Details & Status History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Details Card */}
              <Card className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                  চাকরির বিবরণ ও শর্তাবলী
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">কাজের পরিবেশ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {WORK_ARRANGEMENT_LABELS[application.workArrangement]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">চাকরির ধরণ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {EMPLOYMENT_TYPE_LABELS[application.employmentType]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">চাকরির উৎস:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {JOB_SOURCE_LABELS[application.source]}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">আবেদনের তারিখ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {formatBengaliDate(application.applicationDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">পরবর্তী ফলো-আপ:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {application.nextFollowUpDate
                        ? formatBengaliDate(application.nextFollowUpDate)
                        : 'নির্ধারিত নেই'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">প্রস্তাবিত বেতন:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {application.salaryRange
                        ? `${application.salaryRange} ${application.currency}`
                        : 'উল্লেখ নেই'}
                    </span>
                  </div>
                </div>

                {/* External links */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {application.url && (
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> মূল জব সার্কুলার লিঙ্ক
                    </a>
                  )}
                  {application.companyUrl && (
                    <a
                      href={application.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:underline font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" /> কোম্পানি ওয়েবসাইট
                    </a>
                  )}
                </div>

                {/* Tags */}
                {application.tags && application.tags.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 block mb-1.5">প্রাসঙ্গিক ট্যাগস:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.tags.map((t) => (
                        <Badge key={t} size="sm" variant="slate">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {application.notes && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">ব্যক্তিগত নোট:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                      {application.notes}
                    </p>
                  </div>
                )}
              </Card>

              {/* Status History Timeline */}
              <Card className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" /> স্ট্যাটাস পরিবর্তনের টাইমলাইন
                </h3>

                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {application.statusHistory && application.statusHistory.length > 0 ? (
                    application.statusHistory.map((history, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                        <div className="flex items-center gap-2">
                          <StatusBadge status={history.status} short />
                          <span className="text-xs text-slate-400">
                            {formatBengaliDate(history.changedAt)}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">কোনো হিস্ট্রি রেকর্ড নেই</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Recruiter Info, Attached Docs, Interviews */}
            <div className="space-y-6">
              {/* Recruiter Details */}
              <Card className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" /> রিক্রুটার তথ্য
                </h3>
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 block">নাম:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {application.recruiterName || 'উল্লেখ করা হয়নি'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">যোগাযোগ / ইমেইল:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {application.recruiterContact || 'উল্লেখ করা হয়নি'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ব্যবহৃত সিভি ভার্সন:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {application.resumeVersion || 'Default Resume'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Linked Interview Sessions */}
              <Card className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-500" /> ইন্টারভিউ রেকর্ডসমূহ
                  </h3>
                  <Link href="/interviews" className="text-xs text-blue-600 hover:underline">
                    যুক্ত করুন
                  </Link>
                </div>

                <div className="space-y-2">
                  {interviews.length > 0 ? (
                    interviews.map((item) => (
                      <div
                        key={item.id || item._id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.interviewType}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatBengaliDate(item.interviewDate)}
                          </span>
                        </div>
                        {item.questionsAsked && (
                          <p className="text-slate-500 line-clamp-2">{item.questionsAsked}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-3">
                      এই আবেদনের জন্য কোনো ইন্টারভিউ রেকর্ড করা হয়নি
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">লোড হচ্ছে...</div>}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
