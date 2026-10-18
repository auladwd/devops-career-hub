'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeSession, PracticeDifficulty, PracticeStatus } from '@/lib/types';
import {
  DEVOPS_PRACTICE_CATEGORIES,
  PRACTICE_DIFFICULTY_LABELS,
  PRACTICE_STATUS_LABELS,
} from '@/lib/constants/bengali';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Star } from 'lucide-react';

interface PracticeFormProps {
  initialData?: Partial<PracticeSession>;
  isEditing?: boolean;
}

export function PracticeForm({ initialData, isEditing = false }: PracticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || DEVOPS_PRACTICE_CATEGORIES[4], // Docker
    skill: initialData?.skill || '',
    practiceDate: initialData?.practiceDate || '',
    startTime: initialData?.startTime || '10:00',
    endTime: initialData?.endTime || '11:30',
    durationMinutes: initialData?.durationMinutes || 90,
    difficulty: (initialData?.difficulty || 'intermediate') as PracticeDifficulty,
    confidenceLevel: initialData?.confidenceLevel || 3,
    status: (initialData?.status || 'completed') as PracticeStatus,
    whatPracticed: initialData?.whatPracticed || '',
    codeSnippets: initialData?.codeSnippets || '',
    problemsFaced: initialData?.problemsFaced || '',
    solutionsLearned: initialData?.solutionsLearned || '',
    githubUrl: initialData?.githubUrl || '',
    projectUrl: initialData?.projectUrl || '',
    tagsString: initialData?.tags ? initialData.tags.join(', ') : '',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    if (!formData.practiceDate) {
      setFormData((prev) => ({
        ...prev,
        practiceDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [formData.practiceDate]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate duration when start time and end time change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const [sh, sm] = formData.startTime.split(':').map(Number);
      const [eh, em] = formData.endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diffMinutes = eh * 60 + em - (sh * 60 + sm);
        if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight
        if (diffMinutes > 0) {
          setFormData((prev) => ({ ...prev, durationMinutes: diffMinutes }));
        }
      }
    }
  }, [formData.startTime, formData.endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'অনুশীলনের শিরোনাম দিন' }));
      return;
    }
    if (!formData.skill.trim()) {
      setErrors((prev) => ({ ...prev, skill: 'নির্দিষ্ট স্কিল বা টুলের নাম দিন' }));
      return;
    }
    if (!formData.whatPracticed.trim()) {
      setErrors((prev) => ({ ...prev, whatPracticed: 'কী অনুশীলন করেছেন তা উল্লেখ করুন' }));
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
        ? `/api/practice/${initialData?.id || initialData?._id}`
        : '/api/practice';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
        return;
      }

      toast.success(isEditing ? 'প্র্যাকটিস সেশন আপডেট হয়েছে' : 'নতুন প্র্যাকটিস সেশন রেকর্ড করা হয়েছে');
      router.push('/practice');
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Basic Practice Information */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          ১. অনুশীলন পরিচিতি
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="অনুশীলনের শিরোনাম (Session Title)"
              required
              placeholder="উদাঃ Multi-stage Dockerfile তৈরি ও Alpine Linux অপটিমাইজেশন"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
            />
          </div>

          <Input
            label="নির্দিষ্ট স্কিল / কমান্ড (Skill)"
            required
            placeholder="উদাঃ Docker, K8s Pods, Terraform"
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            error={errors.skill}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="ক্যাটাগরি"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {DEVOPS_PRACTICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Select
            label="কঠিনতার মাত্রা (Difficulty)"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
          >
            {Object.entries(PRACTICE_DIFFICULTY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          <Select
            label="সেশন স্ট্যাটাস"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            {Object.entries(PRACTICE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        {/* Date, Time, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            type="date"
            label="অনুশীলনের তারিখ"
            required
            value={formData.practiceDate}
            onChange={(e) => setFormData({ ...formData, practiceDate: e.target.value })}
          />
          <Input
            type="time"
            label="শুরুর সময়"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <Input
            type="time"
            label="শেষের সময়"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
          <Input
            type="number"
            label="মোট সময় (মিনিট)"
            required
            min={1}
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
            helperText="স্বয়ংক্রিয় গণনা"
          />
        </div>

        {/* Confidence Level Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            আত্মবিশ্বাস রেটিং (Confidence Level: ১ থেকে ৫)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, confidenceLevel: level })}
                className={`p-2 rounded-lg border flex items-center gap-1 text-xs font-semibold transition-all ${
                  formData.confidenceLevel >= level
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Practical Details: What practiced, code, problems, solutions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          ২. ল্যাব ও টেকনিক্যাল অভিজ্ঞতা
        </h3>

        <Textarea
          label="কী কী বিষয় অনুশীলন করেছেন (What I Practiced)"
          required
          placeholder="ল্যাব উদ্দেশ্য, কোন কোন কনফিগারেশন সেটআপ করেছেন..."
          value={formData.whatPracticed}
          onChange={(e) => setFormData({ ...formData, whatPracticed: e.target.value })}
          error={errors.whatPracticed}
        />

        <Textarea
          label="ব্যবহৃত কমান্ড বা কোড স্নিপেট (Commands / Code Snippets)"
          placeholder="docker build -t myapp:latest .
kubectl apply -f deployment.yaml..."
          className="font-mono text-xs"
          value={formData.codeSnippets}
          onChange={(e) => setFormData({ ...formData, codeSnippets: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Textarea
            label="যেসব সমস্যার মুখোমুখি হয়েছেন (Problems Encountered)"
            placeholder="পারমিশন ডিনাইড এরর, ইমেজ সাইজ বড় হওয়া, নেটওয়ার্ক রিচাবিলিটি..."
            value={formData.problemsFaced}
            onChange={(e) => setFormData({ ...formData, problemsFaced: e.target.value })}
          />

          <Textarea
            label="সমাধান ও নতুন শিক্ষা (Solutions & Lessons Learned)"
            placeholder="Multi-stage বিল্ড ব্যবহার করে সমাধান করেছি, non-root ইউজার যোগ করেছি..."
            value={formData.solutionsLearned}
            onChange={(e) => setFormData({ ...formData, solutionsLearned: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="গিটহাব রিপোজিটরি লিংক (GitHub URL)"
            placeholder="https://github.com/yourusername/devops-lab"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          />
          <Input
            label="লাইভ প্রজেক্ট / আর্কিটেকচার লিঙ্ক (Project URL)"
            placeholder="https://mylab.example.com"
            value={formData.projectUrl}
            onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
          />
        </div>

        <Input
          label="ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)"
          placeholder="dockerfile, alpine, container-security"
          value={formData.tagsString}
          onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
        />
      </div>

      {/* Buttons */}
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
          <Save className="w-4 h-4" /> {isEditing ? 'সেশন আপডেট করুন' : 'প্র্যাকটিস সেশন সংরক্ষণ করুন'}
        </Button>
      </div>
    </form>
  );
}
