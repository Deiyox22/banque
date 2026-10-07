import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Les écrans des prochaines étapes (Statistiques, Paramètres) s'ajoutent ici
// au fur et à mesure qu'ils existent.
const NAV_ITEMS = [
  { to: '/', label: "Aujourd'hui" },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/maquettes', label: 'Maquettes' },
  { to: '/messages', label: 'Messages' },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-16 md:flex md:pb-0">
      <nav
        aria-label="Navigation principale"
        className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-slate-200 md:p-4 dark:md:border-slate-800"
      >
        <p className="px-2 text-sm font-semibold">ELS Tech</p>
        <div className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Se déconnecter
        </button>
      </nav>

      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
