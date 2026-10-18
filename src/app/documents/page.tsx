'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DocumentItem, DocumentCategory } from '@/lib/types';
import { DOCUMENT_CATEGORY_LABELS } from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import {
  FolderLock,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'resume' as DocumentCategory,
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const query = categoryFilter !== 'all' ? `?category=${categoryFilter}` : '';
      const res = await fetch(`/api/documents${query}`);
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch {
      toast.error('ডকুমেন্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ফাইলের আকার ১০ মেগাবাইটের (10MB) বেশি হতে পারবে না');
        return;
      }
      setSelectedFile(file);
      if (!uploadForm.name) {
        setUploadForm((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('অনুগ্রহ করে একটি ফাইল নির্বাচন করুন');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', uploadForm.name || selectedFile.name);
    formData.append('category', uploadForm.category);
    formData.append('notes', uploadForm.notes);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'আপলোড ব্যর্থ হয়েছে');
        return;
      }

      toast.success('ডকুমেন্ট সফলভাবে আপলোড হয়েছে!');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadForm({ name: '', category: 'resume', notes: '' });
      fetchDocuments();
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ডকুমেন্ট মুছে ফেলা হয়েছে');
        fetchDocuments();
      } else {
        toast.error('মুছতে ব্যর্থ');
      }
    } catch {
      toast.error('সমস্যা হয়েছে');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '০ KB';
    if (bytes >= 1024 * 1024) {
      return `${toBengaliNumber((bytes / (1024 * 1024)).toFixed(1))} MB`;
    }
    return `${toBengaliNumber(Math.round(bytes / 1024))} KB`;
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <FolderLock className="w-7 h-7 text-indigo-600" /> সুরক্ষিত সিভি ও ডকুমেন্টস ভল্ট
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              সিভি/রেজ্যুমে, কভার লেটার ও সার্টিফিকেশন ফাইল নিরাপদে ক্লাউডে সংরক্ষণ ও এক্সেস করুন
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-1.5 shadow-xs"
          >
            <Upload className="w-4 h-4" /> ফাইল আপলোড করুন
          </Button>
        </div>

        {/* Security Notification Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p>
            আপনার আপলোডকৃত ফাইলসমূহ Cloudinary তে আপনার ব্যক্তিগত ফোল্ডারে সংরক্ষিত হয় এবং সার্ভার লেভেল ভেরিফিকেশন ছাড়া অন্য কোনো একাউন্ট থেকে দেখার সুযোগ নেই।
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            সকল ফাইল
          </button>
          {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCategoryFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === k
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">ডকুমেন্ট লোড হচ্ছে...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <FolderLock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো ডকুমেন্ট আপলোড করা নেই
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              আপনার সাম্প্রতিক DevOps সিভি বা সার্টিফিকেট আপলোড করে রাখুন।
            </p>
            <Button size="sm" variant="primary" onClick={() => setIsUploadModalOpen(true)}>
              ফাইল আপলোড করুন
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card
                key={doc.id || doc._id}
                className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Badge size="sm" variant="purple">
                      {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                    </Badge>
                    <button
                      onClick={() => handleDeleteDocument((doc.id || doc._id)!)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-2.5 mt-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {doc.originalFilename}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(doc.bytes)}
                    </span>
                    <span>•</span>
                    <span>{formatBengaliDate(doc.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={doc.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> ফাইল ওপেন / ডাউনলোড করুন
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="নতুন ডকুমেন্ট আপলোড"
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আকার: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    ফাইল নির্বাচন করতে ক্লিক করুন
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PDF, Word (.docx), বা ছবি (সর্বোচ্চ ১০ মেগাবাইট)
                  </p>
                </div>
              )}
            </div>

            <Input
              label="ফাইলের পরিচিতি নাম"
              placeholder="উদাঃ DevOps Senior Resume 2026"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
            />

            <Select
              label="ফাইলের ক্যাটাগরি"
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
            >
              {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>

            <Input
              label="নোট (ঐচ্ছিক)"
              placeholder="উদাঃ AWS & K8s ফোকাসড ভার্সন"
              value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                disabled={!selectedFile}
              >
                আপলোড করুন
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
