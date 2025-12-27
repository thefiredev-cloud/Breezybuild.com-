import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

// Display font for headings
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

// Body font
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Breezy Build | AI-Powered Development Newsletter',
  description: 'Daily insights for non-technical founders learning to build with AI. Join 2,800+ vibe coders shipping apps without writing code.',
  keywords: ['AI development', 'no-code', 'vibe coding', 'newsletter', 'Claude', 'ChatGPT', 'Cursor'],
  authors: [{ name: 'Breezy Build' }],
  openGraph: {
    title: 'Breezy Build | AI-Powered Development Newsletter',
    description: 'Daily insights for non-technical founders learning to build with AI.',
    url: 'https://breezybuild.com',
    siteName: 'Breezy Build',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breezy Build | AI-Powered Development Newsletter',
    description: 'Daily insights for non-technical founders learning to build with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
