// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, Target, ArrowRight, Wallet, TrendingUp, CalendarDays } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';

export default function LandingAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  const router = useRouter();
  const supabase = createClient();

  const openLogin = () => { setAuthTab('login'); setIsAuthOpen(true); };
  const openRegister = () => { setAuthTab('register'); setIsAuthOpen(true); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); setLoading(false); } 
    else { router.push('/'); router.refresh(); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) { alert(error.message); setLoading(false); }
    else {
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          avatar_color: '#f472b6'
        });
      }
      alert('Inscription réussie !');
      setLoading(false);
      setIsAuthOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/50 backdrop-blur-md px-5 py-2 text-xs font-black text-primary mb-8 shadow-soft">
          <Sparkles size={14} strokeWidth={3} />
          <span>L'APP BUDGÉTAIRE TOUT-EN-UN</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-7xl mb-6 text-primary">
          VAULT — <span className="italic text-rose-500">Votre</span><br />
          Budget, Maîtrisé.
        </h1>
        <p className="mx-auto max-w-lg text-sm font-bold text-muted-foreground/80 mb-10 leading-relaxed">
          Suivez vos revenus, contrôlez vos dépenses et atteignez vos objectifs d'épargne avec élégance, partout, tout le temps.
        </p>

        <div className="flex flex-col gap-3 mb-16">
          <Button size="lg" onClick={openRegister} className="h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-glow transition-all hover:scale-[1.02]">
            Démarrer Gratuitement
          </Button>
          <Button variant="outline" size="lg" onClick={openLogin} className="h-14 border-primary/20 bg-white/40 font-black rounded-2xl">
            Se connecter
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left">
          {[
            { icon: TrendingUp, title: "Analyse Intelligente", desc: "Visualisez vos dépenses par catégorie et comprenez où va votre argent." },
            { icon: Target, title: "Épargne Objectif", desc: "Définissez des buts, épargnez petit à petit et suivez vos progrès." },
            { icon: CalendarDays, title: "Transactions Récurrentes", desc: "Automatisez le suivi de vos revenus et charges fixes." }
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-primary/5 bg-white/40 backdrop-blur-sm">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-primary">{f.title}</h3>
                <p className="text-[11px] font-bold text-muted-foreground/80 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-soft bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary tracking-tight text-center pt-4">{authTab === 'login' ? 'Content de te revoir !' : 'Rejoins l\'aventure ✨'}</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl h-10">
              <TabsTrigger value="login" className="rounded-lg text-xs font-black">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg text-xs font-black">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="animate-in fade-in">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-12" />
                <Input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-12" />
                <Button type="submit" className="w-full h-12 rounded-xl font-black">Connexion</Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="animate-in fade-in">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input placeholder="Nom" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="rounded-xl h-12" />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-12" />
                <Input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-12" />
                <Button type="submit" className="w-full h-12 rounded-xl font-black">S'inscrire</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <footer className="py-10 text-center text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
        VAULT © 2026 — BUDGET FAMILIAL
      </footer>
    </div>
  );
}

