'use client';

import React from 'react';
import Link from 'next/link';
import { JobApplication, PracticeSession, TaskItem, InterviewSession } from '@/lib/types';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS, PRACTICE_DIFFICULTY_LABELS } from '@/lib/constants/bengali';
import { Card, Badge } from '../ui/Badge';
import {
  Briefcase,
  Terminal,
  CheckSquare,
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface RecentListsProps {
  recentApplications: JobApplication[];
  recentPracticeSessions: PracticeSession[];
  todayTasks: TaskItem[];
  upcomingInterviews: InterviewSession[];
  onToggleTask?: (taskId: string, currentStatus: string) => void;
}

export function RecentLists({
  recentApplications,
  recentPracticeSessions,
  todayTasks,
  upcomingInterviews,
  onToggleTask,
}: RecentListsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Recent Job Applications */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              সাম্প্রতিক জব আবেদন
            </h3>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
          {recentApplications.length > 0 ? (
            recentApplications.map((app) => {
              const statusColor = APPLICATION_STATUS_COLORS[app.status] || {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-300',
              };

              return (
                <div
                  key={app.id || app._id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/applications/${app.id || app._id}`}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                    >
                      {app.position}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {app.company} {app.location ? `• ${app.location}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                    >
                      {APPLICATION_STATUS_LABELS[app.status]?.split(' ')[0] || app.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatBengaliDate(app.applicationDate || app.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              এখনও কোনো জব আবেদন যুক্ত করা হয়নি।{' '}
              <Link href="/applications/new" className="text-blue-600 underline">
                প্রথম আবেদনটি যুক্ত করুন
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Today's Tasks */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              আজকের টাস্কসমূহ
            </h3>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            টাস্ক ম্যানেজার <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div
                key={task.id || task._id}
                className="py-3 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => onToggleTask && onToggleTask(task.id || task._id!, task.status)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.status === 'completed'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {task.category} {task.dueTime ? `• সময়: ${task.dueTime}` : ''}
                  </p>
                </div>
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
                  {task.priority === 'high' ? 'উচ্চ' : task.priority === 'medium' ? 'মাঝারি' : 'সাধারণ'}
                </Badge>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              আজকের জন্য কোনো টাস্ক বাকি নেই।{' '}
              <Link href="/tasks" className="text-blue-600 underline">
                নতুন টাস্ক যোগ করুন
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Recent DevOps Practice Sessions */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              সাম্প্রতিক প্র্যাকটিস সেশন
            </h3>
          </div>
          <Link
            href="/practice"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            সব সেশন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
          {recentPracticeSessions.length > 0 ? (
            recentPracticeSessions.map((session) => (
              <div
                key={session.id || session._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {session.title}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {session.skill}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {toBengaliNumber(session.durationMinutes)} মিনিট
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge size="sm" variant="info">
                    {PRACTICE_DIFFICULTY_LABELS[session.difficulty]?.split(' ')[0] || session.difficulty}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {formatBengaliDate(session.practiceDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              এখনও কোনো প্র্যাকটিস রেকর্ড করা হয়নি।{' '}
              <Link href="/practice/new" className="text-blue-600 underline">
                প্রথম ল্যাব সেশন লগ করুন
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Upcoming Interviews */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              আসন্ন ইন্টারভিউ সিডিউল
            </h3>
          </div>
          <Link
            href="/interviews"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            ইন্টারভিউ মডিউল <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map((interview) => (
              <div
                key={interview.id || interview._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {interview.companyName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    পদ: {interview.role}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge size="sm" variant="purple">
                    {interview.interviewType}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {formatBengaliDate(interview.interviewDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              কোনো আসন্ন ইন্টারভিউ শিডিউল করা নেই
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
