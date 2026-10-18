import type { Metadata } from 'next';
import { Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevOps Career Hub | ক্যারিয়ার ও প্র্যাকটিস ট্র্যাকার',
  description:
    'DevOps জব অ্যাপ্লিকেশন, হ্যান্ডস-অন ল্যাব প্র্যাকটিস, লার্নিং রোডম্যাপ, ইন্টারভিউ প্রস্তুতি ও ক্যারিয়ার লক্ষ্য ব্যবস্থাপনার সম্পূর্ণ প্ল্যাটফর্ম।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className={hindSiliguri.variable}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
