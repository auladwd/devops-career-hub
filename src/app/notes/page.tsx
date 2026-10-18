'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { NoteItem } from '@/lib/types';
import { formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import {
  FileText,
  Plus,
  Pin,
  Search,
  Trash2,
  Edit,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'DevOps',
    tagsString: '',
    isPinned: false,
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);

      const res = await fetch(`/api/notes?${query.toString()}`);
      if (res.ok) setNotes(await res.json());
    } catch {
      toast.error('নোট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreateModal = () => {
    setEditingNote(null);
    setPreviewMode(false);
    setFormData({
      title: '',
      content: '',
      category: 'DevOps',
      tagsString: '',
      isPinned: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (note: NoteItem) => {
    setEditingNote(note);
    setPreviewMode(false);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tagsString: note.tags?.join(', ') || '',
      isPinned: note.isPinned,
    });
    setIsModalOpen(true);
  };

  const handleTogglePin = async (note: NoteItem) => {
    const nextVal = !note.isPinned;
    try {
      const res = await fetch(`/api/notes/${note.id || note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: nextVal }),
      });
      if (res.ok) {
        toast.success(nextVal ? 'নোট পিন করা হয়েছে' : 'পিন সরানো হয়েছে');
        fetchNotes();
      }
    } catch {
      toast.error('আপডেট ব্যর্থ');
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('শিরোনাম ও বিষয়বস্তু উভয়ই আবশ্যক');
      return;
    }

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const endpoint = editingNote ? `/api/notes/${editingNote.id || editingNote._id}` : '/api/notes';
      const method = editingNote ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      if (res.ok) {
        toast.success(editingNote ? 'নোট আপডেট হয়েছে' : 'নতুন নোট সংরক্ষণ করা হয়েছে');
        setIsModalOpen(false);
        fetchNotes();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('নোট মুছে ফেলা হয়েছে');
        fetchNotes();
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
              <FileText className="w-7 h-7 text-indigo-600" /> ব্যক্তিগত নোট ও শিক্ষণীয় পয়েন্ট
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              DevOps স্থাপত্য, ক্লাউড টিপস, চিপশিট এবং জরুরি নোট নিরাপদ স্থানে সংরক্ষণ করুন
            </p>
          </div>

          <Button size="sm" variant="primary" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" /> নতুন নোট লিখুন
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নোট খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">নোট লোড হচ্ছে...</div>
        ) : notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">কোনো নোট নেই</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              আপনার প্রয়োজনীয় DevOps টিপস ও কোড স্নিপেট লিখে রাখুন।
            </p>
            <Button size="sm" variant="primary" onClick={openCreateModal}>
              প্রথম নোটটি লিখুন
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id || note._id}
                className={`flex flex-col justify-between transition-all hover:shadow-md ${
                  note.isPinned ? 'border-indigo-400 dark:border-indigo-700 ring-1 ring-indigo-400/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {note.title}
                    </h3>
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1 rounded-md transition-colors ${
                        note.isPinned
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={note.isPinned ? 'আনপিন করুন' : 'পিন করুন'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-6 leading-relaxed mb-3">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatBengaliDate(note.updatedAt || note.createdAt)}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote((note.id || note._id)!)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create / Edit Note Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingNote ? 'নোট সম্পাদনা' : 'নতুন নোট'}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveNote} className="space-y-4">
            <Input
              label="শিরোনাম"
              required
              placeholder="উদাঃ Linux LVM Partition কমান্ড সামারি"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">বিষয়বস্তু (নোট)</label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                {previewMode ? 'এডিটে ফিরুন' : 'প্রিভিউ দেখুন'}
              </button>
            </div>

            {previewMode ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[160px] text-xs whitespace-pre-line leading-relaxed">
                {formData.content || '(কোনো টেক্সট নেই)'}
              </div>
            ) : (
              <Textarea
                rows={7}
                placeholder="আপনার নোট ও কোড স্নিপেট লিখুন..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ক্যাটাগরি"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Input
                label="ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)"
                placeholder="lvm, linux, disk"
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span>এই নোটটি শীর্ষে পিন করে রাখুন</span>
            </label>

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
