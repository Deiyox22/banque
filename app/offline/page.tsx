// app/offline/page.tsx
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#6366f1]/10 text-[#6366f1]">
        <WifiOff size={48} />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight">VAULT</h1>
      <h2 className="mb-4 text-xl font-semibold">Vous êtes hors ligne</h2>
      
      <p className="mb-8 max-w-xs text-gray-400">
        Reconnectez-vous à Internet pour accéder à votre budget familial et synchroniser vos transactions.
      </p>

      <Button asChild className="bg-[#6366f1] hover:bg-[#4f46e5]">
        <Link href="/">Réessayer</Link>
      </Button>
    </div>
  );
}
