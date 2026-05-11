// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { ViewTransitions } from 'next-view-transitions';
import './globals.css';
import PWARegister from '@/components/shared/PWARegister';
import InstallPrompt from '@/components/shared/InstallPrompt';
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VAULT — Budget Familial',
  description: 'Gérez votre budget familial simplement.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VAULT',
  },
};

export const viewport: Viewport = {
  themeColor: '#fce7f3', /* Rose pastel */
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
      <html lang="fr">
        <body
          className={`${outfit.className} antialiased bg-background text-foreground`}
        >
          <PWARegister />
          <main>{children}</main>
          <InstallPrompt />
          <Toaster position="top-center" expand={true} richColors />
        </body>
      </html>
    </ViewTransitions>
  );
}
