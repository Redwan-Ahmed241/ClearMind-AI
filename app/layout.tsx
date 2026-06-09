import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { ChatProvider } from '@/lib/ChatContext';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  style: ['normal', 'italic'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'ClearMind AI — Doubt-Aware Chat',
  description:
    'ClearMind AI is a doubt-aware academic assistant that transparently signals confidence levels for every claim, lets you flag uncertain sentences, and helps you think critically about AI-generated information.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
