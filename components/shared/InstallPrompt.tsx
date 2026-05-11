// components/shared/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Déjà installé ?
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // 2. Refus mémorisé ?
    const isDismissed = localStorage.getItem('pwa-dismissed') === 'true';
    if (isDismissed) return;

    // 3. Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    if (ios) {
      setShowPrompt(true);
    } else {
      // 4. Détection Android/Chrome
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-6 duration-500 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <div className="overflow-hidden rounded-[2.5rem] border-none bg-background/80 backdrop-blur-xl shadow-glow p-2">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:rotate-6 transition-transform">
                <span className="text-2xl font-black italic">V</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-primary tracking-tight leading-tight">Installer VAULT ✨</h3>
                <p className="text-xs font-bold text-muted-foreground/70">
                  Accède à ton budget en un clic !
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-2 text-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            {isIOS ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary/50 p-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/70 border border-primary/5">
                <Share size={18} strokeWidth={3} />
                <span className="leading-relaxed">
                  Appuie sur <span className="text-primary underline">Partager</span> puis{' '}
                  <span className="text-primary underline">Sur l'écran d'accueil</span> 🌸
                </span>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleInstall}
                  className="flex-1 h-14 bg-primary text-primary-foreground font-black text-base shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                  <Download size={20} className="mr-2" strokeWidth={3} />
                  Installer ✨
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-14 px-6 text-primary/40 font-black hover:text-primary hover:bg-primary/5 rounded-full"
                >
                  Plus tard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
