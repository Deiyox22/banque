import { useSession } from './lib/useSession';
import { Login } from './pages/Login';
import { supabase } from './lib/supabase';

export function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      </main>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Suivi prospects — ELS Tech</h1>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-slate-500 underline-offset-2 hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:text-slate-400"
          >
            Se déconnecter
          </button>
        </div>
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Connecté en tant que {session.user.email}. Les écrans Aujourd'hui, Pipeline et Fiche
          prospect arrivent dans la prochaine étape (J2).
        </p>
      </div>
    </main>
  );
}
