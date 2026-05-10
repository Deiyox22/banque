// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ViewTransitions } from 'next-view-transitions';
import './globals.css';
import PWARegister from '@/components/shared/PWARegister';
import InstallPrompt from '@/components/shared/InstallPrompt';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VAULT — Budget Familial',
  description: 'Gérez votre budget familial simplement.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VAULT',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="fr" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white`}
        >
          <PWARegister />
          <main>{children}</main>
          <InstallPrompt />
        </body>
      </html>
    </ViewTransitions>
  );
}
