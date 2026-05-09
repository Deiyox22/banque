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
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#f472b6] flex items-center justify-center text-[#0d0811] group-hover:shadow-[0_0_15px_rgba(244,114,182,0.5)] transition-all">
            <Wallet size={18} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">VAULT</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#security" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sécurité</a>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onLoginClick}
            className="text-gray-300 hover:text-white hover:bg-white/5"
          >
            Se connecter
          </Button>
          <Button 
            onClick={onRegisterClick}
            className="bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90 shadow-[0_0_15px_rgba(244,114,182,0.2)]"
          >
            Démarrer
          </Button>
        </div>
      </div>
    </nav>
  );
}
