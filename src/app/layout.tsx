
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/auth/auth-provider';
import { I18nProvider } from '@/components/i18n-provider';
import Header from '@/components/layout/header';
import { PerformanceMonitor } from '@/components/performance-monitor';


export const metadata: Metadata = {
  title: 'ClarityDocs - AI-Powered Legal Document Simplification',
  description: 'Transform complex legal documents into clear, actionable insights with AI. Get risk assessments, timelines, and expert lawyer consultations.',
  keywords: ['legal documents', 'AI analysis', 'document simplification', 'lawyer consultation', 'contract review'],
  authors: [{ name: 'ClarityDocs' }],
  openGraph: {
    title: 'ClarityDocs - AI-Powered Legal Document Simplification',
    description: 'Transform complex legal documents into clear, actionable insights',
    type: 'website',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={cn('font-body antialiased h-screen flex flex-col')}>
        <PerformanceMonitor />
        <I18nProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
