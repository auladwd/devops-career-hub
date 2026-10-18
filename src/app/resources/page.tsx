'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ResourceItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  Globe,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Documentation',
    description: '',
    tagsString: '',
  });

  const categories = [
    'Documentation',
    'Tutorial',
    'Course',
    'GitHub Repository',
    'DevOps Project Reference',
    'Interview Resource',
    'Job Search Portal',
    'Cheatsheet',
    'Other',
  ];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (categoryFilter !== 'all') query.set('category', categoryFilter);

      const res = await fetch(`/api/resources?${query.toString()}`);
      if (res.ok) setResources(await res.json());
    } catch {
      toast.error('রিসোর্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, search]);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      url: '',
      category: 'Documentation',
      description: '',
      tagsString: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r: ResourceItem) => {
    setEditingResource(r);
    setFormData({
      title: r.title,
      url: r.url,
      category: r.category,
      description: r.description || '',
      tagsString: r.tags?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('শিরোনাম ও URL উভয়ই আবশ্যক');
      return;
    }

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const endpoint = editingResource
        ? `/api/resources/${editingResource.id || editingResource._id}`
        : '/api/resources';
      const method = editingResource ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      if (res.ok) {
        toast.success(editingResource ? 'রিসোর্স আপডেট হয়েছে' : 'নতুন রিসোর্স যোগ হয়েছে');
        setIsModalOpen(false);
        fetchResources();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('রিসোর্স মুছে ফেলা হয়েছে');
        fetchResources();
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
              <Bookmark className="w-7 h-7 text-blue-600" /> রিসোর্স ও লিঙ্ক বুকমার্ক লাইব্রেরি
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ডকুমেন্টেশন, ভিডিও কোর্স, গিটহাব প্রজেক্ট রেফারেন্স ও জব পোর্টাল লিঙ্ক সংরক্ষণ করুন
            </p>
          </div>

          <Button size="sm" variant="primary" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" /> নতুন লিঙ্ক বুকমার্ক করুন
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="রিসোর্স খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">রিসোর্স লোড হচ্ছে...</div>
        ) : resources.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো বুকমার্ক পাওয়া যায়নি
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              উপকারী রেফারেন্স লিঙ্ক সংরক্ষণ করতে উপরের বাটনে ক্লিক করুন।
            </p>
            <Button size="sm" variant="primary" onClick={openCreateModal}>
              প্রথম লিঙ্ক যোগ করুন
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <Card
                key={res.id || res._id}
                className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Badge size="sm" variant="info">
                      {res.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(res)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource((res.id || res._id)!)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 line-clamp-1">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline truncate max-w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{res.url}</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingResource ? 'রিসোর্স সম্পাদনা' : 'নতুন রিসোর্স বুকমার্ক'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveResource} className="space-y-4">
            <Input
              label="রিসোর্সের নাম / শিরোনাম"
              required
              placeholder="উদাঃ Official Kubernetes Documentation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Input
              label="ওয়েব লিংক (URL)"
              required
              placeholder="https://kubernetes.io/docs"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />

            <Select
              label="ক্যাটাগরি"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Textarea
              label="সংক্ষিপ্ত বিবরণ"
              placeholder="এই রিসোর্সটিতে কী কী বিষয় রয়েছে..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
      </div>
    </DashboardShell>
  );
}
