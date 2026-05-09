// components/shared/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#f472b6]/20 bg-[#1a1122] px-4 py-2 flex justify-around items-center md:hidden">
        {routes.map((route) => {
          const Icon = route.icon;
          const active = pathname === route.href;
          return (
            <Link 
              key={route.href} 
              href={route.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                active ? "text-[#f472b6]" : "text-gray-500"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{route.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#f472b6]/10 bg-[#1a1122] md:flex transition-all",
        isOpen ? "w-64" : "w-20"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className={cn("flex items-center gap-2 font-bold text-[#f472b6]", !isOpen && "hidden")}>
            <span className="text-2xl tracking-tighter italic">VAULT</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-[#f472b6]">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {routes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5",
                  active ? "bg-[#f472b6]/10 text-[#f472b6]" : "text-gray-400 hover:text-white",
                  !isOpen && "justify-center"
                )}
              >
                <Icon size={22} />
                {isOpen && <span>{route.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#6366f1]/10">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-x-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10",
              !isOpen && "justify-center"
            )}
          >
            <LogOut size={22} />
            {isOpen && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}

