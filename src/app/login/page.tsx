'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Server, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">লোড হচ্ছে...</p>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      toast.success('সফলভাবে লগইন হয়েছে!');
    } catch (err: any) {
      toast.error('গুগল লগইনে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন বা ফায়ারবেস কনফিগারেশন চেক করুন।');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative selection:bg-blue-500 selection:text-white">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> হোম পেজে ফিরে যান
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Server className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            DevOps Career Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            আপনার ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন
          </p>
        </div>

        {/* Google Login Button */}
        <div>
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full justify-center gap-3 py-3 border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold shadow-xs"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            গুগল (Google) দিয়ে সাইন-ইন করুন
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>আপনার তথ্য সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
}
