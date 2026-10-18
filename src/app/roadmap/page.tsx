'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RoadmapMilestone, MilestoneStatus, Priority } from '@/lib/types';
import {
  MILESTONE_STATUS_LABELS,
  PRIORITY_LABELS,
  DEVOPS_PRACTICE_CATEGORIES,
} from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  Map,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillCategory: 'Linux & Shell Scripting',
    priority: 'medium' as Priority,
    plannedStartDate: '',
    targetCompletionDate: '',
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinksString: '',
    notes: '',
  });

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roadmap');
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
        setOverallProgress(data.overallProgress || 0);
      }
    } catch {
      toast.error('রোডম্যাপ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const openCreateModal = () => {
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      skillCategory: 'Linux & Shell Scripting',
      priority: 'medium',
      plannedStartDate: '',
      targetCompletionDate: '',
      status: 'not_started',
      progressPercent: 0,
      resourceLinksString: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: RoadmapMilestone) => {
    setEditingMilestone(item);
    setFormData({
      title: item.title,
      description: item.description,
      skillCategory: item.skillCategory,
      priority: item.priority,
      plannedStartDate: item.plannedStartDate || '',
      targetCompletionDate: item.targetCompletionDate || '',
      status: item.status,
      progressPercent: item.progressPercent,
      resourceLinksString: item.resourceLinks?.join(', ') || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('মাইলস্টোনের শিরোনাম দিন');
      return;
    }

    const resourceLinks = formData.resourceLinksString
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    const payload = {
      ...formData,
      resourceLinks,
    };

    try {
      const endpoint = editingMilestone
        ? `/api/roadmap/${editingMilestone.id || editingMilestone._id}`
        : '/api/roadmap';
      const method = editingMilestone ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingMilestone ? 'মাইলস্টোন আপডেট হয়েছে' : 'নতুন মাইলস্টোন যুক্ত হয়েছে');
        setIsModalOpen(false);
        fetchRoadmap();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleQuickProgressUpdate = async (id: string, newPercent: number) => {
    const newStatus: MilestoneStatus =
      newPercent >= 100 ? 'completed' : newPercent > 0 ? 'in_progress' : 'not_started';

    try {
      const res = await fetch(`/api/roadmap/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressPercent: newPercent,
          status: newStatus,
        }),
      });
      if (res.ok) {
        toast.success(`অগ্রগতি ${toBengaliNumber(newPercent)}% এ আপডেট হয়েছে`);
        fetchRoadmap();
      }
    } catch {
      toast.error('আপডেট করতে ব্যর্থ');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/roadmap/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('মাইলস্টোন মুছে ফেলা হয়েছে');
        setDeleteId(null);
        fetchRoadmap();
      }
    } catch {
      toast.error('মুছতে ব্যর্থ');
    }
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Map className="w-7 h-7 text-indigo-600" /> DevOps লার্নিং রোডম্যাপ
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              বেসিক ফান্ডামেন্টালস থেকে প্রডাকশন রেডি DevOps স্কিল আয়ত্ত করার পর্যায়ক্রমিক মাইলস্টোন
            </p>
          </div>

          <Button size="sm" variant="primary" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" /> কাস্টম মাইলস্টোন যোগ করুন
          </Button>
        </div>

        {/* Overall Roadmap Progress Card */}
        <Card className="p-5 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border-blue-200 dark:border-blue-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                সামগ্রিক রোডম্যাপ সমাপ্তি হার
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {toBengaliNumber(overallProgress)}%
                </span>
                <span className="text-xs text-slate-500">
                  (সম্পন্ন: {toBengaliNumber(completedCount)} / {toBengaliNumber(milestones.length)} টি মাইলস্টোন)
                </span>
              </div>
            </div>

            <div className="sm:w-72">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Milestones List / Timeline */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            রোডম্যাপ লোড হচ্ছে...
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((m, index) => {
              const isCompleted = m.status === 'completed' || m.progressPercent === 100;

              return (
                <Card
                  key={m.id || m._id}
                  className={`transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                    isCompleted ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {toBengaliNumber(m.order || index + 1)}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {m.title}
                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {m.skillCategory}
                          </span>
                          <span>•</span>
                          <span>অগ্রাধিকার: {PRIORITY_LABELS[m.priority]}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        size="sm"
                        variant={
                          m.status === 'completed'
                            ? 'success'
                            : m.status === 'in_progress'
                            ? 'warning'
                            : 'slate'
                        }
                      >
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </Badge>
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="এডিট করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id || m._id!)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Progress Slider & Quick Toggle */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>অগ্রগতি: {toBengaliNumber(m.progressPercent)}%</span>
                        {m.targetCompletionDate && (
                          <span>টার্গেট: {formatBengaliDate(m.targetCompletionDate)}</span>
                        )}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={m.progressPercent}
                        onChange={(e) =>
                          handleQuickProgressUpdate(
                            (m.id || m._id)!,
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isCompleted ? 'secondary' : 'outline'}
                        onClick={() =>
                          handleQuickProgressUpdate((m.id || m._id)!, isCompleted ? 0 : 100)
                        }
                        className="text-xs py-1"
                      >
                        {isCompleted ? 'পুনরায় শুরু করুন' : 'সম্পন্ন চিহ্নিত করুন'}
                      </Button>
                    </div>
                  </div>

                  {/* Resource Links */}
                  {m.resourceLinks && m.resourceLinks.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 text-xs">
                      {m.resourceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> রিসোর্স {toBengaliNumber(idx + 1)}
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit Milestone Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMilestone ? 'মাইলস্টোন সম্পাদনা করুন' : 'নতুন কাস্টম মাইলস্টোন যুক্ত করুন'}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveMilestone} className="space-y-4">
            <Input
              label="মাইলস্টোনের শিরোনাম"
              required
              placeholder="উদাঃ Terraform Advanced Modules & Terragrunt"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="বিবরণ (কী কী আয়ত্ত করতে চান)"
              required
              placeholder="মাইলস্টোনের মূল উদ্দেশ্য ও শেখার টপিকস লিখুন..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="স্কিল ক্যাটাগরি"
                value={formData.skillCategory}
                onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value })}
              >
                {DEVOPS_PRACTICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                label="অগ্রাধিকার"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="date"
                label="শুরুর পরিকল্পনা তারিখ"
                value={formData.plannedStartDate}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
              />
              <Input
                type="date"
                label="টার্গেট সমাপ্তির তারিখ"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
              />
            </div>

            <Input
              label="রিসোর্স লিংকসমূহ (কমা দিয়ে আলাদা করুন)"
              placeholder="https://learn.hashicorp.com, https://kubernetes.io"
              value={formData.resourceLinksString}
              onChange={(e) => setFormData({ ...formData, resourceLinksString: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" variant="primary" size="sm">
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="মাইলস্টোন মুছে ফেলা"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm">আপনি কি নিশ্চিত যে এই মাইলস্টোনটি মুছে ফেলতে চান?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                বাতিল
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
