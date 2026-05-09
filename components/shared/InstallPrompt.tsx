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
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="overflow-hidden rounded-xl border border-[#6366f1] bg-[#13131a] shadow-2xl">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366f1]/20 text-[#6366f1]">
                <span className="text-xl font-bold">V</span>
              </div>
              <div>
                <h3 className="font-bold text-white">Installer VAULT</h3>
                <p className="text-sm text-gray-400">
                  Ajoutez l'app sur votre écran d'accueil pour un accès rapide.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {isIOS ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1]/10 p-3 text-xs text-[#6366f1]">
                <Share size={16} />
                <span>
                  Appuyez sur <span className="font-bold">Partager</span> puis{' '}
                  <span className="font-bold">Sur l'écran d'accueil</span>
                </span>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-[#6366f1] font-bold hover:bg-[#4f46e5]"
                >
                  <Download size={18} className="mr-2" />
                  Installer
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white"
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
