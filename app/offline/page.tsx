// app/offline/page.tsx
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'next-view-transitions';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background selection:bg-primary/30">
      <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary shadow-soft animate-bounce duration-[3000ms]">
        <WifiOff size={48} strokeWidth={2.5} />
      </div>
      
      <h1 className="mb-2 text-4xl font-black tracking-tighter text-primary">VAULT</h1>
      <h2 className="mb-6 text-xl font-bold text-accent-foreground italic">Oups ! Tu es hors ligne 🌸</h2>
      
      <p className="mb-12 max-w-xs text-muted-foreground/80 font-bold leading-relaxed">
        Reconnecte-toi à Internet pour accéder à ton budget familial et synchroniser tes rêves. ✨
      </p>

      <Button asChild className="h-16 px-12 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-105 active:scale-95">
        <Link href="/">Réessayer ✨</Link>
      </Button>
    </div>
  );
}
