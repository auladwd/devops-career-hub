'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Server,
  Briefcase,
  Terminal,
  Map,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/Badge';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                DevOps Career Hub
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                পেশাদার ক্যারিয়ার ও প্র্যাকটিস ট্র্যাকার
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" variant="primary" className="gap-2">
                  ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="primary" className="gap-2">
                  লগইন করুন <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            সম্পূর্ণ বাংলায় আধুনিক DevOps ক্যারিয়ার ম্যানেজমেন্ট সমাধান
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight sm:leading-tight">
            আপনার DevOps যাত্রা, জব ট্র্যাকিং ও প্র্যাকটিস রাখুন{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
              এক নজরে ও পূর্ণ নিয়ন্ত্রণে
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            চাকরির আবেদন, ল্যাব সেশন, লার্নিং রোডম্যাপ, ইন্টারভিউ প্রস্তুতি, ব্যক্তিগত নোট এবং প্রয়োজনীয় ক্লাউড সার্টিফিকেট নিরাপদে সংরক্ষণ ও পর্যবেক্ষণ করুন এক ছাতার নিচে।
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full gap-2 text-base shadow-lg shadow-blue-500/25">
                  আপনার ড্যাশবোর্ডে যান <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full gap-2 text-base shadow-lg shadow-blue-500/25">
                  গুগল অ্যাকাউন্ট দিয়ে শুরু করুন <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base">
                ফিচারসমূহ দেখুন
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>১০০% আলাদা ও ব্যক্তিগত ডেটা</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>MongoDB Atlas এ সুরক্ষিত তথ্য</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Firebase Google Sign-In নিরাপত্তা</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 sm:py-24 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              DevOps ক্যারিয়ার গড়ার প্রতিটি ধাপের জন্য তৈরি
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              প্রতিটি ফিচার বাস্তব অভিজ্ঞতা ও নিয়মানুবর্তিতা ধরে রাখার জন্য বিশেষভাবে নকশা করা হয়েছে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                জব অ্যাপ্লিকেশন ট্র্যাকিং
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                টেবিল ও কানবান বোর্ড ভিউতে আবেদন ট্র্যাক করুন। স্ট্যাটাস হিস্ট্রি, পরবর্তী ফলো-আপ তারিখ এবং ডুপ্লিকেট আবেদনের সতর্কবার্তা পান।
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                হ্যান্ডস-অন প্র্যাকটিস ট্র্যাকার
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Docker, Kubernetes, Linux, AWS ও CI/CD সেশন রেকর্ড করুন। কোড স্নিপেট, ফেস করা সমস্যা ও সমাধান লগ করুন এবং স্ট্রিক ধরে রাখুন।
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                DevOps লার্নিং রোডম্যাপ
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ১৪টি সুনির্দিষ্ট মাইলস্টোন সম্পন্ন করার অগ্রগতি ট্র্যাক করুন অথবা নিজের প্রয়োজনমতো কাস্টম মাইলস্টোন যোগ করে প্ল্যান সাজান।
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                টাস্ক ও ক্যালেন্ডার প্ল্যানিং
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                আজকের কাজ, আসন্ন ডেডলাইন ও ওভারডিউ টাস্কগুলোর তদারকি করুন। বাংলাদেশ সময় (Asia/Dhaka) অনুযায়ী পরিকল্পিত শিডিউল বজায় রাখুন।
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                ইন্টারভিউ ব্যাংক ও হিস্ট্রি
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                DevOps টেকনিক্যাল প্রশ্নোত্তরের ব্যাংক তৈরি করুন, আত্মবিশ্বাস রেটিং দিন এবং জব অ্যাপ্লিকেশনের সাথে ইন্টারভিউ আলোচনার রেকর্ড রাখুন।
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                মাল্টি-ইউজার ডেটা আইসোলেশন
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                সার্ভার-সাইড সেশন এনফোর্সমেন্ট ও ইউজার-লেভেল কুয়েরি ফিল্টারিং। কোনো ব্যবহারকারী অন্য কোনো ব্যবহারকারীর তথ্য বা সিভি অ্যাক্সেস করতে পারবে না।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Isolation Section */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" /> সর্বোচ্চ নিরাপত্তা ও ডেটা গোপনীয়তা
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              আপনার ডেটা সম্পূর্ণ আপনারই নিয়ন্ত্রণে
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              আমরা কোনো ক্লায়েন্ট-সাইড ফিল্টারের ওপর নির্ভর করি না। প্রতিটি ডেটাবেস কুয়েরি এবং ফাইল আপলোড সরাসরি সার্ভার-সাইড Firebase Admin সেশন দিয়ে যাচাই করা হয়। যে কোনো সময় আপনার সম্পূর্ণ ডেটা UTF-8 সাপোর্টেড CSV বা JSON ফরম্যাটে এক্সপোর্ট করতে পারেন অথবা অ্যাকাউন্ট মুছে ফেলতে পারেন।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold border-none">
                  এখনই শুরু করুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
            <Server className="w-4 h-4 text-blue-600" />
            <span>DevOps Career Hub (বাংলা সংস্করণ)</span>
          </div>
          <p>© 2026 সর্বস্বত্ব সংরক্ষিত। DevOps প্র্যাকটিশনারদের পেশাদার ক্যারিয়ার বৃদ্ধির জন্য নিবেদিত।</p>
        </div>
      </footer>
    </div>
  );
}
