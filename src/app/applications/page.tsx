'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { StatusBadge } from '@/components/applications/StatusBadge';
import {
  APPLICATION_STATUS_LABELS,
  WORK_ARRANGEMENT_LABELS,
  JOB_SOURCE_LABELS,
} from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Download,
  Table as TableIcon,
  Kanban,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: viewMode === 'kanban' ? '100' : '15',
        search,
        status: statusFilter,
        source: sourceFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const res = await fetch(`/api/applications?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch {
      toast.error('আবেদন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sourceFilter, viewMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleQuickStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          statusChangeNote: `কুইক স্ট্যাটাস আপডেট: ${APPLICATION_STATUS_LABELS[newStatus]}`,
        }),
      });
      if (res.ok) {
        toast.success('স্ট্যাটাস আপডেট হয়েছে!');
        fetchApplications();
      } else {
        toast.error('আপডেট করতে ব্যর্থ');
      }
    } catch {
      toast.error('সমস্যা হয়েছে');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/applications/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('আবেদনটি মুছে ফেলা হয়েছে');
        setDeleteId(null);
        fetchApplications();
      } else {
        toast.error('মুছতে ব্যর্থ');
      }
    } catch {
      toast.error('সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const kanbanColumns: ApplicationStatus[] = [
    'saved',
    'ready',
    'applied',
    'screening',
    'interview_technical',
    'offer',
    'rejected',
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header & Main Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Briefcase className="w-7 h-7 text-blue-600" /> জব অ্যাপ্লিকেশন ট্র্যাকার
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              মোট {toBengaliNumber(totalCount)} টি আবেদনের তথ্য সংরক্ষিত রয়েছে
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="টেবিল ভিউ"
              >
                <TableIcon className="w-4 h-4" /> টেবিল
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="কানবান বোর্ড ভিউ"
              >
                <Kanban className="w-4 h-4" /> কানবান
              </button>
            </div>

            {/* Export CSV */}
            <a href="/api/applications/export" download>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
              </Button>
            </a>

            {/* New Application Button */}
            <Link href="/applications/new">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-xs">
                <Plus className="w-4 h-4" /> নতুন আবেদন
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="কোম্পানি বা পদবী খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">সকল উৎস (Source)</option>
              {Object.entries(JOB_SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="secondary" className="w-full">
                খুঁজুন
              </Button>
              {(search || statusFilter !== 'all' || sourceFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setSourceFilter('all');
                    setPage(1);
                  }}
                  className="text-xs text-rose-500 hover:underline shrink-0 px-2"
                >
                  রিসেট
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content Views */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            আবেদনের তালিকা লোড হচ্ছে...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো আবেদন পাওয়া যায়নি
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              ফিল্টার পরিবর্তন করুন অথবা আপনার প্রথম জব আবেদনটি ডাটাবেসে যোগ করুন।
            </p>
            <Link href="/applications/new">
              <Button size="md" variant="primary">
                নতুন আবেদন যুক্ত করুন
              </Button>
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">কোম্পানি ও পদবী</th>
                    <th className="px-4 py-3.5 font-semibold">স্ট্যাটাস</th>
                    <th className="px-4 py-3.5 font-semibold">কাজের ধরণ</th>
                    <th className="px-4 py-3.5 font-semibold">আবেদনের তারিখ</th>
                    <th className="px-4 py-3.5 font-semibold">পরবর্তী ফলো-আপ</th>
                    <th className="px-4 py-3.5 font-semibold text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr
                      key={app.id || app._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/applications/${app.id || app._id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block"
                        >
                          {app.position}
                        </Link>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{app.company}</span>
                          {app.location && <span>• {app.location}</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={app.status} short />
                          {/* Quick Status Select */}
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                (app.id || app._id)!,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className="text-[11px] py-0.5 px-1 bg-transparent border border-slate-200 dark:border-slate-700 rounded text-slate-500 cursor-pointer"
                            title="কুইক স্ট্যাটাস পরিবর্তন"
                          >
                            {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.split(' ')[0]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        <span>{WORK_ARRANGEMENT_LABELS[app.workArrangement]}</span>
                        <span className="block text-[11px] text-slate-400">
                          {JOB_SOURCE_LABELS[app.source]}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {formatBengaliDate(app.applicationDate || app.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {app.nextFollowUpDate ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {formatBengaliDate(app.nextFollowUpDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="জব লিংক ওপেন করুন"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/applications/${app.id || app._id}`}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="বিস্তারিত দেখুন"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(app.id || app._id!)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  পৃষ্ঠা {toBengaliNumber(page)} / {toBengaliNumber(totalPages)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    পরবর্তী <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((colStatus) => {
              const colApps = applications.filter((app) => app.status === colStatus);

              return (
                <div
                  key={colStatus}
                  className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col min-w-[260px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {APPLICATION_STATUS_LABELS[colStatus]}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {toBengaliNumber(colApps.length)}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[600px] flex-1 pr-1">
                    {colApps.map((app) => (
                      <div
                        key={app.id || app._id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs hover:shadow-sm transition-all"
                      >
                        <Link
                          href={`/applications/${app.id || app._id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block line-clamp-1"
                        >
                          {app.position}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {app.company}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                          <span>{formatBengaliDate(app.applicationDate || app.createdAt)}</span>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/applications/${app.id || app._id}`}
                              className="text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {colApps.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
                        কোনো আবেদন নেই
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="আবেদন মুছে ফেলার নিশ্চয়তা"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-semibold">
                আপনি কি নিশ্চিত যে এই জব আবেদনটি মুছে ফেলতে চান?
              </p>
            </div>
            <p className="text-xs text-slate-500">
              এই প্রক্রিয়াটি অপরিবর্তনীয় এবং এর সাথে সম্পর্কিত সকল স্ট্যাটাস রেকর্ড মুছে যাবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                বাতিল করুন
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
