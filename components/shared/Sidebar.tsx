// components/shared/Sidebar.tsx
'use client';

import { Link } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Objectifs', icon: Target, href: '/goals' },
  { label: 'Paramètres', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getHref = (href: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    return queryString ? `${href}?${queryString}` : href;
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md h-16 px-6 flex justify-between items-center bg-background/70 backdrop-blur-lg border border-primary/20 rounded-full shadow-soft md:hidden">
        {routes.slice(0, 2).map((route) => {
          const Icon = route.icon;
          const active = pathname === route.href;
          return (
            <Link 
              key={route.href} 
              href={getHref(route.href)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all",
                active ? "text-primary scale-110" : "text-muted-foreground/70"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[9px] font-semibold", active ? "opacity-100" : "opacity-0")}>{route.label}</span>
            </Link>
          );
        })}
        
        {/* Espace pour le FAB central */}
        <div className="w-14 h-14" />

        {routes.slice(2).map((route) => {
          const Icon = route.icon;
          const active = pathname === route.href;
          return (
            <Link 
              key={route.href} 
              href={getHref(route.href)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all",
                active ? "text-primary scale-110" : "text-muted-foreground/70"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[9px] font-semibold", active ? "opacity-100" : "opacity-0")}>{route.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card md:flex transition-all duration-300 shadow-sm",
        isOpen ? "w-64" : "w-20"
      )}>
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/" className={cn("flex items-center gap-2 font-bold text-primary transition-all", !isOpen && "scale-0 opacity-0 hidden")}>
            <span className="text-2xl tracking-tighter italic font-black">VAULT</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-primary hover:bg-primary/10 rounded-full">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6">
          {routes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={getHref(route.href)}
                className={cn(
                  "flex items-center gap-x-4 rounded-3xl px-4 py-3 text-sm font-bold transition-all group",
                  active ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-primary/60 hover:bg-primary/5 hover:text-primary",
                  !isOpen && "justify-center"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {isOpen && <span className="tracking-tight">{route.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-x-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-3xl py-6",
              !isOpen && "justify-center"
            )}
          >
            <LogOut size={22} />
            {isOpen && <span className="font-semibold">Déconnexion</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}

