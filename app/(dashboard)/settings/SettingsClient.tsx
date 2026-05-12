'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/lib/actions/auth';

import { useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';

export default function SettingsClient({ displayName }: { displayName: string }) {
  const [name, setName] = useState(displayName);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const storeDisplayName = useVaultStore((state) => state.displayName);

  useEffect(() => setMounted(true), []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        await deleteAccount();
    }
  };

  return (
    <div className="p-1 sm:p-6 space-y-12 pb-32">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">Réglages ✨</h1>
        <p className="text-muted-foreground font-semibold italic">Personnalise ton expérience VAULT.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Profil */}
        <Card className="rounded-3xl border-none shadow-soft bg-white/40 backdrop-blur-sm overflow-hidden p-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-primary tracking-tight">Profil 🌸</CardTitle>
            <CardDescription className="text-muted-foreground/80 font-bold">Gère ton nom d'affichage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2" htmlFor="name">Ton petit nom</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-white/50 rounded-2xl font-bold" 
              />
            </div>
            <Button className="w-full h-14 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02]">
              Enregistrer ✨
            </Button>
          </CardContent>
        </Card>

        {/* Compte */}
        <Card className="rounded-3xl border-none shadow-soft bg-white/40 backdrop-blur-sm overflow-hidden p-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-primary tracking-tight">Compte 🔒</CardTitle>
            <CardDescription className="text-muted-foreground/80 font-bold">Sécurité et déconnexion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full h-14 border-primary/20 bg-white/40 text-primary font-black rounded-full shadow-soft hover:bg-white/60 transition-all" onClick={handleLogout}>
              Déconnexion
            </Button>
            <Button variant="ghost" className="w-full h-14 text-destructive font-black hover:bg-destructive/5 rounded-full transition-all mt-4" onClick={handleDelete}>
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-12 pb-8">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
          {mounted ? (storeDisplayName || 'Utilisateur') : 'Utilisateur'} La Star ✨
        </p>
      </div>
    </div>
  );
}
