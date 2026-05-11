// components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-primary/10 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground group-hover:shadow-glow transition-all duration-300 group-hover:rotate-6">
            <Wallet size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-primary">VAULT</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Fonctionnalités</a>
          <a href="#security" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Sécurité</a>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onLoginClick}
            className="text-primary font-bold hover:bg-primary/10 rounded-full px-6"
          >
            Se connecter
          </Button>
          <Button 
            onClick={onRegisterClick}
            className="bg-primary text-primary-foreground font-black shadow-glow hover:shadow-glow/50 rounded-full px-8 py-6 transition-all hover:scale-105 active:scale-95"
          >
            Démarrer
          </Button>
        </div>
      </div>
    </nav>
  );
}
