'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TaskItem, TaskStatus, Priority } from '@/lib/types';
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [view, setView] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [todayStr, setTodayStr] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium' as Priority,
    dueDate: '',
    dueTime: '12:00',
    status: 'pending' as TaskStatus,
    relatedType: 'general' as any,
    notes: '',
  });

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?view=${view}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data || []);
      }
    } catch {
      toast.error('টাস্ক লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      priority: 'medium',
      dueDate: todayStr,
      dueTime: '12:00',
      status: 'pending',
      relatedType: 'general',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime || '',
      status: task.status,
      relatedType: task.relatedType,
      notes: task.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${task.id || task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(nextStatus === 'completed' ? 'টাস্ক সম্পন্ন হয়েছে' : 'পেন্ডিং করা হয়েছে');
        fetchTasks();
      }
    } catch {
      toast.error('স্ট্যাটাস আপডেট ব্যর্থ');
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('টাস্কের শিরোনাম দিন');
      return;
    }

    try {
      const endpoint = editingTask ? `/api/tasks/${editingTask.id || editingTask._id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingTask ? 'টাস্ক আপডেট হয়েছে' : 'নতুন টাস্ক তৈরি হয়েছে');
        setIsModalOpen(false);
        fetchTasks();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('টাস্ক মুছে ফেলা হয়েছে');
        fetchTasks();
      }
    } catch {
      toast.error('মুছতে ব্যর্থ');
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <CheckSquare className="w-7 h-7 text-amber-500" /> ক্যারিয়ার টাস্ক ম্যানেজার
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              দৈনন্দিন জব ফলো-আপ, ল্যাব অ্যাসাইনমেন্ট ও ইন্টারভিউ প্রস্তুতি তালিকা
            </p>
          </div>

          <Button size="sm" variant="primary" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" /> নতুন টাস্ক যোগ করুন
          </Button>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'সকল টাস্ক' },
            { id: 'today', label: 'আজকের কাজ' },
            { id: 'upcoming', label: 'আসন্ন টাস্ক' },
            { id: 'overdue', label: 'বিলম্বে চলমান (Overdue)' },
            { id: 'completed', label: 'সম্পন্ন হয়েছে' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">টাস্ক লোড হচ্ছে...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো টাস্ক বাকি নেই
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              নতুন লক্ষ্য বা ক্যারিয়ার কার্যক্রম যোগ করে ট্র্যাক করুন।
            </p>
            <Button size="md" variant="primary" onClick={openCreateModal}>
              নতুন টাস্ক তৈরি করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isOverdue = task.dueDate < todayStr && task.status !== 'completed';
              const isDone = task.status === 'completed';

              return (
                <Card
                  key={task.id || task._id}
                  className={`flex items-start justify-between gap-3 p-4 transition-all ${
                    isDone ? 'opacity-70 bg-slate-50 dark:bg-slate-900/40' : ''
                  } ${isOverdue ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20' : ''}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleTaskStatus(task)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>

                        <Badge
                          size="sm"
                          variant={
                            task.priority === 'high'
                              ? 'danger'
                              : task.priority === 'medium'
                              ? 'warning'
                              : 'slate'
                          }
                        >
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>

                        {isOverdue && (
                          <Badge size="sm" variant="danger">
                            সময়সীমা পার হয়েছে
                          </Badge>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatBengaliDate(task.dueDate)}
                        </span>
                        {task.dueTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask((task.id || task._id)!)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTask ? 'টাস্ক সম্পাদনা' : 'নতুন টাস্ক তৈরি করুন'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveTask} className="space-y-4">
            <Input
              label="টাস্কের শিরোনাম"
              required
              placeholder="উদাঃ Terraform মডিউল প্র্যাকটিস শেষ করা"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="বিস্তারিত বর্ণনা"
              placeholder="টাস্ক সংক্রান্ত যেকোনো নির্দেশনা বা বিবরণ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ক্যাটাগরি"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

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

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="শেষ করার তারিখ (Due Date)"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />

              <Input
                type="time"
                label="সময় (ঐচ্ছিক)"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>

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
      </div>
    </DashboardShell>
  );
}
