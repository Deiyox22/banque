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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#f472b6]/30">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f472b6]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c084fc]/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16 text-center lg:pt-48">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f472b6]/20 bg-[#f472b6]/5 px-4 py-1.5 text-sm font-medium text-[#f472b6] mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles size={16} />
          <span>L'application budget préférée des familles</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Gérez votre argent avec <br />
          <span className="italic text-[#f472b6] drop-shadow-[0_0_15px_rgba(244,114,182,0.3)]">élégance & clarté.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          VAULT est l'outil tout-en-un pour suivre vos dépenses, épargner pour vos rêves et apprendre la gestion financière à vos enfants dans un univers sécurisé et stylé.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Button 
            size="lg" 
            onClick={openRegister}
            className="h-14 px-8 bg-[#f472b6] text-[#0d0811] font-bold text-lg hover:bg-[#f472b6]/90 shadow-[0_0_30px_rgba(244,114,182,0.3)] rounded-2xl transition-all hover:scale-105"
          >
            Démarrer Gratuitement
            <ArrowRight size={20} className="ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={openLogin}
            className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
          >
            Déjà membre ?
          </Button>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 pt-20">
          {[
            { icon: ShieldCheck, title: "Sécurité Totale", desc: "Vos données sont protégées par Supabase et cryptées de bout en bout.", id: "security" },
            { icon: Baby, title: "Argent de Poche", desc: "Créez des comptes pour vos enfants et fixez des limites mensuelles." },
            { icon: Target, title: "Objectifs de Vie", desc: "Visualisez votre progression vers vos rêves les plus fous." }
          ].map((f, i) => (
            <div key={i} id={f.id} className="group p-8 rounded-3xl border border-white/5 bg-[#13131a]/50 backdrop-blur-sm transition-all hover:border-[#f472b6]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#f472b6]/10 flex items-center justify-center text-[#f472b6] mb-6 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{authTab === 'login' ? 'Bienvenue chez VAULT' : 'Créer votre compte'}</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 p-1 border border-white/5">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#f472b6] data-[state=active]:text-[#0d0811]">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#f472b6] data-[state=active]:text-[#0d0811]">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" type="email" placeholder="maia@exemple.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="h-12 bg-black/40 border-white/10 focus:border-[#f472b6]/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input 
                    id="password" type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="h-12 bg-black/40 border-white/10 focus:border-[#f472b6]/50 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90 mt-4 rounded-xl">
                  {loading ? 'Connexion...' : 'Accéder à mon VAULT'}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nom d'affichage</Label>
                  <Input 
                    id="reg-name" placeholder="Maïa"
                    value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                    className="h-12 bg-black/40 border-white/10 focus:border-[#f472b6]/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" type="email" placeholder="maia@exemple.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="h-12 bg-black/40 border-white/10 focus:border-[#f472b6]/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <Input 
                    id="reg-password" type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="h-12 bg-black/40 border-white/10 focus:border-[#f472b6]/50 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90 mt-4 rounded-xl">
                  {loading ? 'Création...' : 'Créer mon compte'}
                  <Heart size={18} className="ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>


      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet size={16} />
          <span className="font-bold text-gray-400 tracking-tighter">VAULT</span>
        </div>
        <p>© 2026 VAULT — Conçu avec ❤️ pour les familles modernes.</p>
      </footer>
    </div>
  );
}

