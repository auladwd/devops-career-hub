'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobApplication, ApplicationStatus, WorkArrangement, EmploymentType, JobSource } from '@/lib/types';
import {
  APPLICATION_STATUS_LABELS,
  WORK_ARRANGEMENT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  JOB_SOURCE_LABELS,
} from '@/lib/constants/bengali';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

interface ApplicationFormProps {
  initialData?: Partial<JobApplication>;
  isEditing?: boolean;
}

export function ApplicationForm({ initialData, isEditing = false }: ApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  const [formData, setFormData] = useState({
    company: initialData?.company || '',
    position: initialData?.position || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    workArrangement: (initialData?.workArrangement || 'remote') as WorkArrangement,
    employmentType: (initialData?.employmentType || 'full-time') as EmploymentType,
    experienceLevel: initialData?.experienceLevel || 'Mid-Level',
    source: (initialData?.source || 'LinkedIn') as JobSource,
    url: initialData?.url || '',
    companyUrl: initialData?.companyUrl || '',
    salaryRange: initialData?.salaryRange || '',
    currency: initialData?.currency || 'BDT',
    dateDiscovered: initialData?.dateDiscovered || '',
    applicationDate: initialData?.applicationDate || '',
    status: (initialData?.status || 'applied') as ApplicationStatus,
    recruiterName: initialData?.recruiterName || '',
    recruiterContact: initialData?.recruiterContact || '',
    resumeVersion: initialData?.resumeVersion || 'DevOps-Resume-v2.pdf',
    coverLetter: initialData?.coverLetter || '',
    nextFollowUpDate: initialData?.nextFollowUpDate || '',
    interviewDate: initialData?.interviewDate || '',
    notes: initialData?.notes || '',
    tagsString: initialData?.tags ? initialData.tags.join(', ') : 'Kubernetes, AWS, Terraform',
    statusChangeNote: '',
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      dateDiscovered: prev.dateDiscovered || todayStr,
      applicationDate: prev.applicationDate || todayStr,
    }));
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const checkDuplicate = async () => {
    if (!formData.company || !formData.position) return;
    try {
      const res = await fetch('/api/applications/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.company,
          position: formData.position,
          excludeId: initialData?.id || initialData?._id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.duplicate && data.duplicate.existingCount > 0) {
          setDuplicateWarning(data.duplicate);
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic frontend checks
    if (!formData.company.trim()) {
      setErrors((prev) => ({ ...prev, company: 'কোম্পানির নাম আবশ্যক' }));
      return;
    }
    if (!formData.position.trim()) {
      setErrors((prev) => ({ ...prev, position: 'পদের নাম আবশ্যক' }));
      return;
    }

    setLoading(true);
    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      tags,
    };

    try {
      const endpoint = isEditing
        ? `/api/applications/${initialData?.id || initialData?._id}`
        : '/api/applications';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          toast.error(data.details.join(', '));
        } else {
          toast.error(data.error || 'আবেদন সংরক্ষণ ব্যর্থ হয়েছে');
        }
        return;
      }

      toast.success(isEditing ? 'আবেদন সফলভাবে আপডেট হয়েছে' : 'নতুন জব আবেদন সফলভাবে যোগ করা হয়েছে');
      router.push('/applications');
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {duplicateWarning && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">ডুপ্লিকেট সতর্কবার্তা:</p>
            <p>
              এই কোম্পানিতে ({formData.company}) ইতিমধ্যে আপনার{' '}
              {duplicateWarning.existingCount} টি আবেদন রয়েছে।
              {duplicateWarning.exactMatch && (
                <span className="font-bold block mt-0.5">
                  একই পদের নাম ({formData.position}) ইতিমধ্যে ডাটাবেসে বিদ্যমান!
                </span>
              )}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              (একই কোম্পানিতে ভিন্ন পদের জন্য আবেদন করা বৈধ, এটি কেবল আপনাকে অবগত করার জন্য সতর্কবার্তা)
            </p>
          </div>
        </div>
      )}

      {/* Basic Job Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          ১. প্রাথমিক চাকরির তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="কোম্পানির নাম"
            required
            placeholder="উদাঃ Brain Station 23, Kaz Software"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            onBlur={checkDuplicate}
            error={errors.company}
          />
          <Input
            label="পদের নাম (Job Title)"
            required
            placeholder="উদাঃ DevOps Engineer, SRE, Cloud Engineer"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            onBlur={checkDuplicate}
            error={errors.position}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="কাজের পরিবেশ (Work Arrangement)"
            value={formData.workArrangement}
            onChange={(e) => setFormData({ ...formData, workArrangement: e.target.value as any })}
          >
            {Object.entries(WORK_ARRANGEMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          <Select
            label="চাকরির ধরণ (Employment Type)"
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
          >
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          <Select
            label="চাকরির উৎস (Job Source)"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
          >
            {Object.entries(JOB_SOURCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="লোকেশন / শহর"
            placeholder="উদাঃ Dhaka, Bangladesh (বা Remote)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="অভিজ্ঞতার মাত্রা"
            placeholder="উদাঃ 1-3 years, Junior, Mid, Senior"
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="জব সার্কুলার লিংক (URL)"
            placeholder="https://linkedin.com/jobs/view/..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <Input
            label="কোম্পানি ওয়েবসাইট"
            placeholder="https://company.com"
            value={formData.companyUrl}
            onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
          />
        </div>
      </div>

      {/* Status & Compensation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          ২. আবেদনের অবস্থা ও বেতন
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="আবেদনের স্ট্যাটাস"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            label="আবেদনের তারিখ"
            value={formData.applicationDate}
            onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
          />

          <Input
            type="date"
            label="তথ্য পাওয়ার তারিখ"
            value={formData.dateDiscovered}
            onChange={(e) => setFormData({ ...formData, dateDiscovered: e.target.value })}
          />
        </div>

        {isEditing && (
          <Input
            label="স্ট্যাটাস পরিবর্তনের নোট (ঐচ্ছিক)"
            placeholder="উদাঃ প্রথম রাউন্ড টেকনিক্যাল ইন্টারভিউ ভালো হয়েছে, অ্যাসাইনমেন্ট চেয়েছেন"
            value={formData.statusChangeNote}
            onChange={(e) => setFormData({ ...formData, statusChangeNote: e.target.value })}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="বেতন পরিসীমা (Salary Range)"
            placeholder="উদাঃ 80,000 - 120,000"
            value={formData.salaryRange}
            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
          />
          <Input
            label="মুদ্রা (Currency)"
            placeholder="BDT, USD, EUR"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          />
          <Input
            type="date"
            label="পরবর্তী ফলো-আপ তারিখ"
            value={formData.nextFollowUpDate}
            onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
          />
        </div>
      </div>

      {/* Recruiter & Attached Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          ৩. রিক্রুটার ও জমা দেওয়া নথিপত্র
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="রিক্রুটারের নাম"
            placeholder="উদাঃ Mr. X, HR Lead"
            value={formData.recruiterName}
            onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
          />
          <Input
            label="রিক্রুটারের ইমেইল / যোগাযোগ"
            placeholder="hr@company.com"
            value={formData.recruiterContact}
            onChange={(e) => setFormData({ ...formData, recruiterContact: e.target.value })}
          />
          <Input
            label="ব্যবহৃত সিভি ভার্সন"
            placeholder="DevOps_Resume_2026_v2.pdf"
            value={formData.resumeVersion}
            onChange={(e) => setFormData({ ...formData, resumeVersion: e.target.value })}
          />
        </div>

        <Input
          label="ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)"
          placeholder="AWS, Kubernetes, Terraform, Docker, CI/CD"
          value={formData.tagsString}
          onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
        />

        <Textarea
          label="ব্যক্তিগত নোট বা ইন্টারভিউ অভিজ্ঞতা"
          placeholder="কোম্পানির প্রযুক্তি স্ট্যাক, টিম সাইজ বা গুরুত্বপূর্ণ কথা লিখে রাখুন..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> ফিরে যান
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="gap-2 shadow-md shadow-blue-500/20"
        >
          <Save className="w-4 h-4" /> {isEditing ? 'আপডেট সংরক্ষণ করুন' : 'আবেদন সংরক্ষণ করুন'}
        </Button>
      </div>
    </form>
  );
}
