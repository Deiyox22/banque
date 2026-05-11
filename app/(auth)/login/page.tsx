// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, Heart, Baby, Target, ArrowRight, Wallet } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      // Create profile record
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          avatar_color: '#f472b6'
        });
      }
      alert('Inscription réussie ! Vérifiez vos emails.');
      setLoading(false);
      setIsAuthOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16 text-center lg:pt-48">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/50 backdrop-blur-md px-5 py-2 text-sm font-bold text-primary mb-10 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-soft">
          <Sparkles size={16} strokeWidth={3} />
          <span>L'application budget préférée des familles</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-8xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-primary">
          Gérez votre argent avec <br />
          <span className="italic text-accent-foreground drop-shadow-sm font-black">élégance & clarté.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-bold text-muted-foreground/80 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          VAULT est l'outil tout-en-un pour suivre vos dépenses, épargner pour vos rêves et apprendre la gestion financière à vos enfants dans un univers sécurisé et stylé.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Button 
            size="lg" 
            onClick={openRegister}
            className="h-16 px-10 bg-primary text-primary-foreground font-black text-xl shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-105"
          >
            Démarrer Gratuitement ✨
            <ArrowRight size={22} className="ml-2" strokeWidth={3} />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={openLogin}
            className="h-16 px-10 border-primary/20 bg-white/40 backdrop-blur-sm hover:bg-white/60 text-primary font-black text-lg rounded-full shadow-soft transition-all"
          >
            Déjà membre ?
          </Button>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 pt-24">
          {[
            { icon: ShieldCheck, title: "Sécurité Totale", desc: "Vos données sont protégées par Supabase et cryptées de bout en bout.", id: "security" },
            { icon: Baby, title: "Argent de Poche", desc: "Créez des comptes pour vos enfants et fixez des limites mensuelles." },
            { icon: Target, title: "Objectifs de Vie", desc: "Visualisez votre progression vers vos rêves les plus fous." }
          ].map((f, i) => (
            <div key={i} id={f.id} className="group p-10 rounded-[2.5rem] border border-primary/5 bg-white/40 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-soft text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <f.icon size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-primary tracking-tight">{f.title}</h3>
              <p className="text-base font-bold text-muted-foreground/70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-soft bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-primary tracking-tight text-center pt-4">{authTab === 'login' ? 'Coucou ! ✨' : 'Bienvenue ! 🌸'}</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-secondary/50 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-4">
              <form onSubmit={handleLogin} className="space-y-6 text-left">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Email</Label>
                  <Input 
                    id="email" type="email" placeholder="maia@exemple.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="h-14 bg-white/50 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" title="password" className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Mot de passe</Label>
                  <Input 
                    id="password" type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="h-14 bg-white/50 rounded-2xl font-bold"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-16 w-full bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 mt-6 rounded-full transition-all hover:scale-[1.02]">
                  {loading ? 'Connexion...' : 'Accéder à mon VAULT ✨'}
                  <ArrowRight size={20} className="ml-2" strokeWidth={3} />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4">
              <form onSubmit={handleRegister} className="space-y-5 text-left">
                <div className="space-y-3">
                  <Label htmlFor="reg-name" className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Nom d'affichage</Label>
                  <Input 
                    id="reg-name" placeholder="Maïa"
                    value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                    className="h-14 bg-white/50 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="reg-email" className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Email</Label>
                  <Input 
                    id="reg-email" type="email" placeholder="maia@exemple.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="h-14 bg-white/50 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="reg-password" title="reg-password" className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Mot de passe</Label>
                  <Input 
                    id="reg-password" type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="h-14 bg-white/50 rounded-2xl font-bold"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-16 w-full bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 mt-6 rounded-full transition-all hover:scale-[1.02]">
                  {loading ? 'Création...' : 'Créer mon compte 🌸'}
                  <Heart size={20} className="ml-2" strokeWidth={3} />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>


      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-primary/5 text-center text-primary/60 text-sm font-bold">
        <div className="flex items-center justify-center gap-2 mb-6 group cursor-default">
          <Wallet size={20} className="text-primary group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
          <span className="font-black text-primary text-xl tracking-tighter italic">VAULT</span>
        </div>
        <p>© 2026 VAULT — Conçu avec ❤️ pour les familles modernes.</p>
      </footer>
    </div>
  );
}

