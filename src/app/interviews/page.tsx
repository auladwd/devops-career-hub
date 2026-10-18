'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { InterviewQuestion, InterviewSession, PracticeDifficulty, InterviewType } from '@/lib/types';
import {
  DEVOPS_PRACTICE_CATEGORIES,
  PRACTICE_DIFFICULTY_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '@/lib/constants/bengali';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  HelpCircle,
  Plus,
  Star,
  RotateCcw,
  BookOpen,
  Calendar,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'sessions'>('questions');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [revisitOnly, setRevisitOnly] = useState(false);

  // Hidden answers state for self-testing mode!
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    category: DEVOPS_PRACTICE_CATEGORIES[0] as string,
    difficulty: 'intermediate' as PracticeDifficulty,
    confidenceLevel: 3,
    needsRevision: false,
    personalNotes: '',
  });

  // Session Modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<InterviewSession | null>(null);
  const [sessionForm, setSessionForm] = useState({
    companyName: '',
    role: '',
    interviewDate: '',
    interviewType: 'technical' as InterviewType,
    topicsDiscussed: '',
    questionsAsked: '',
    selfAssessment: '',
    lessonsLearned: '',
    nextActions: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'questions') {
        const query = new URLSearchParams();
        if (categoryFilter !== 'all') query.set('category', categoryFilter);
        if (revisitOnly) query.set('needsRevision', 'true');

        const res = await fetch(`/api/interviews/questions?${query.toString()}`);
        if (res.ok) setQuestions(await res.json());
      } else {
        const res = await fetch('/api/interviews/sessions');
        if (res.ok) setSessions(await res.json());
      }
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, categoryFilter, revisitOnly]);

  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleRevision = async (q: InterviewQuestion) => {
    const nextVal = !q.needsRevision;
    try {
      const res = await fetch(`/api/interviews/questions/${q.id || q._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needsRevision: nextVal }),
      });
      if (res.ok) {
        toast.success(nextVal ? 'রিভিশন তালিকায় যোগ করা হয়েছে' : 'রিভিশন তালিকা থেকে সরানো হয়েছে');
        fetchData();
      }
    } catch {
      toast.error('আপডেট ব্যর্থ');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question.trim() || !questionForm.answer.trim()) {
      toast.error('প্রশ্ন ও উত্তর উভয়ই আবশ্যক');
      return;
    }

    try {
      const endpoint = editingQuestion
        ? `/api/interviews/questions/${editingQuestion.id || editingQuestion._id}`
        : '/api/interviews/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm),
      });

      if (res.ok) {
        toast.success(editingQuestion ? 'প্রশ্ন আপডেট হয়েছে' : 'নতুন প্রশ্ন যোগ হয়েছে');
        setIsQuestionModalOpen(false);
        fetchData();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.companyName.trim() || !sessionForm.role.trim()) {
      toast.error('কোম্পানি ও পদের নাম আবশ্যক');
      return;
    }

    try {
      const endpoint = editingSession
        ? `/api/interviews/sessions/${editingSession.id || editingSession._id}`
        : '/api/interviews/sessions';
      const method = editingSession ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm),
      });

      if (res.ok) {
        toast.success(editingSession ? 'সেশন আপডেট হয়েছে' : 'ইন্টারভিউ সেশন সেভ হয়েছে');
        setIsSessionModalOpen(false);
        fetchData();
      } else {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/interviews/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('প্রশ্ন মুছে ফেলা হয়েছে');
        fetchData();
      }
    } catch {
      toast.error('মুছতে ব্যর্থ');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/interviews/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('সেশন মুছে ফেলা হয়েছে');
        fetchData();
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
              <HelpCircle className="w-7 h-7 text-purple-600" /> ইন্টারভিউ প্রস্তুতি ও অভিজ্ঞতা
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              DevOps টেকনিক্যাল প্রশ্ন ব্যাংক, রিভিশন চেকলিস্ট ও রিয়েল ইন্টারভিউ রেকর্ড
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'questions' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setEditingQuestion(null);
                  setQuestionForm({
                    question: '',
                    answer: '',
                    category: DEVOPS_PRACTICE_CATEGORIES[0],
                    difficulty: 'intermediate',
                    confidenceLevel: 3,
                    needsRevision: false,
                    personalNotes: '',
                  });
                  setIsQuestionModalOpen(true);
                }}
                className="gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> নতুন প্রশ্ন যোগ করুন
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setEditingSession(null);
                  setSessionForm({
                    companyName: '',
                    role: '',
                    interviewDate: new Date().toISOString().split('T')[0],
                    interviewType: 'technical',
                    topicsDiscussed: '',
                    questionsAsked: '',
                    selfAssessment: '',
                    lessonsLearned: '',
                    nextActions: '',
                  });
                  setIsSessionModalOpen(true);
                }}
                className="gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> ইন্টারভিউ লগ করুন
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> টেকনিক্যাল প্রশ্ন ব্যাংক
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> ইন্টারভিউ সেশন হিস্ট্রি
          </button>
        </div>

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  {DEVOPS_PRACTICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={revisitOnly}
                    onChange={(e) => setRevisitOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <span>শুধুমাত্র রিভিশন প্রয়োজন ({questions.filter((q) => q.needsRevision).length})</span>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">প্রশ্ন লোড হচ্ছে...</div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                কোনো প্রশ্ন পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isRevealed = revealedAnswers[q.id || q._id!];

                  return (
                    <Card key={q.id || q._id} className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="font-bold text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded shrink-0">
                            প্র. {toBengaliNumber(idx + 1)}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {q.question}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">
                                {q.category}
                              </span>
                              <span>•</span>
                              <span>{PRACTICE_DIFFICULTY_LABELS[q.difficulty]}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                <Star className="w-3 h-3 fill-current" />
                                {q.confidenceLevel}/৫
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleAnswer((q.id || q._id)!)}
                            className="text-xs gap-1 py-1"
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> উত্তর লুকান
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" /> উত্তর দেখুন
                              </>
                            )}
                          </Button>
                          <button
                            onClick={() => handleToggleRevision(q)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              q.needsRevision
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                            title="রিভিশন ফ্ল্যাগ"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion((q.id || q._id)!)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Answer Reveal Area */}
                      {isRevealed && (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in duration-200">
                          <div>
                            <span className="font-bold text-slate-500 block mb-1">উত্তর:</span>
                            <p className="whitespace-pre-line leading-relaxed">{q.answer}</p>
                          </div>
                          {q.personalNotes && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-slate-500">
                              <span className="font-semibold block mb-0.5">টিপস / নোট:</span>
                              <p>{q.personalNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">লোড হচ্ছে...</div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                কোনো ইন্টারভিউ সেশন হিস্ট্রি রেকর্ড করা হয়নি।
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sess) => (
                  <Card key={sess.id || sess._id} className="space-y-3">
                    <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {sess.companyName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          পদ: {sess.role} • তারিখ: {formatBengaliDate(sess.interviewDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge size="sm" variant="purple">
                          {INTERVIEW_TYPE_LABELS[sess.interviewType]}
                        </Badge>
                        <button
                          onClick={() => handleDeleteSession((sess.id || sess._id)!)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {sess.topicsDiscussed && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                          <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            আলোচিত বিষয়বস্তু:
                          </span>
                          <p>{sess.topicsDiscussed}</p>
                        </div>
                      )}
                      {sess.questionsAsked && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                          <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            যেসব প্রশ্ন করা হয়েছিল:
                          </span>
                          <p className="whitespace-pre-line">{sess.questionsAsked}</p>
                        </div>
                      )}
                      {sess.selfAssessment && (
                        <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                            নিজের মূল্যায়ন:
                          </span>
                          <p>{sess.selfAssessment}</p>
                        </div>
                      )}
                      {sess.lessonsLearned && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                            শিক্ষা ও করণীয়:
                          </span>
                          <p>{sess.lessonsLearned}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Question Modal */}
        <Modal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          title={editingQuestion ? 'প্রশ্ন সম্পাদনা' : 'নতুন ইন্টারভিউ প্রশ্ন'}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <Input
              label="প্রশ্ন"
              required
              placeholder="উদাঃ Kubernetes এ Ingress এবং NodePort এর পার্থক্য কী?"
              value={questionForm.question}
              onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
            />

            <Textarea
              label="আদর্শ উত্তর"
              required
              placeholder="সহজ ও কার্যকর ভাষায় টেকনিক্যাল ব্যাখ্যা লিখুন..."
              value={questionForm.answer}
              onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="ক্যাটাগরি"
                value={questionForm.category}
                onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
              >
                {DEVOPS_PRACTICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                label="কঠিনতার মাত্রা"
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })}
              >
                {Object.entries(PRACTICE_DIFFICULTY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              label="ব্যক্তিগত নোট বা পরীক্ষার টিপস (ঐচ্ছিক)"
              placeholder="ইন্টারভিউতে বলার সময় ডায়াগ্রাম আঁকা যেতে পারে..."
              value={questionForm.personalNotes}
              onChange={(e) => setQuestionForm({ ...questionForm, personalNotes: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsQuestionModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" variant="primary" size="sm">
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </Modal>

        {/* Create / Edit Session Modal */}
        <Modal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          title="ইন্টারভিউ সেশন রেকর্ড করুন"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveSession} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="কোম্পানির নাম"
                required
                value={sessionForm.companyName}
                onChange={(e) => setSessionForm({ ...sessionForm, companyName: e.target.value })}
              />
              <Input
                label="পদের নাম (Role)"
                required
                value={sessionForm.role}
                onChange={(e) => setSessionForm({ ...sessionForm, role: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="ইন্টারভিউ তারিখ"
                required
                value={sessionForm.interviewDate}
                onChange={(e) => setSessionForm({ ...sessionForm, interviewDate: e.target.value })}
              />
              <Select
                label="ইন্টারভিউ ধরণ"
                value={sessionForm.interviewType}
                onChange={(e) => setSessionForm({ ...sessionForm, interviewType: e.target.value as any })}
              >
                {Object.entries(INTERVIEW_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              label="যেসব প্রশ্ন করা হয়েছিল"
              placeholder="ইন্টারভিউয়ারদের করা প্রশ্নগুলো পয়েন্ট আকারে লিখুন..."
              value={sessionForm.questionsAsked}
              onChange={(e) => setSessionForm({ ...sessionForm, questionsAsked: e.target.value })}
            />

            <Textarea
              label="নিজের মূল্যায়ন ও শিক্ষা"
              placeholder="কেমন হলো, কোথায় আরেকটু স্পষ্ট উত্তর দেওয়া যেত..."
              value={sessionForm.lessonsLearned}
              onChange={(e) => setSessionForm({ ...sessionForm, lessonsLearned: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSessionModalOpen(false)}>
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
