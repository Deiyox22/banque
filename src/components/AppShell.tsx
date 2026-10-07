import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import {
  IconAujourdhui,
  IconMaquettes,
  IconMessages,
  IconParametres,
  IconPipeline,
  IconStatistiques,
} from './NavIcons';

const NAV_ITEMS = [
  { to: '/', label: "Aujourd'hui", Icon: IconAujourdhui },
  { to: '/pipeline', label: 'Pipeline', Icon: IconPipeline },
  { to: '/maquettes', label: 'Maquettes', Icon: IconMaquettes },
  { to: '/messages', label: 'Messages', Icon: IconMessages },
  { to: '/statistiques', label: 'Statistiques', Icon: IconStatistiques },
  { to: '/parametres', label: 'Paramètres', Icon: IconParametres },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:flex md:pb-0">
      <nav
        aria-label="Navigation principale"
        className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-slate-200 md:bg-white md:p-4 dark:md:border-slate-800 dark:md:bg-slate-900"
      >
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Se déconnecter
          </button>
        </div>
      </nav>

      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle className="px-2 py-1" />
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-900"
      >
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 px-1 py-2 text-center text-[10px] font-medium focus:outline-2 focus:-outline-offset-2 focus:outline-sky-500 ${
                isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-11 items-center justify-center rounded-full ${
                    isActive ? 'bg-sky-50 dark:bg-sky-950' : ''
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
