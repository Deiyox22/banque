import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'connexion' | 'erreur'>('idle');
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('connexion');
    setErreur(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus('erreur');
      setErreur(error.message);
      return;
    }

    setStatus('idle');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6">
        <Logo taille="h-20 w-20" />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold">Suivi prospects</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Connectez-vous avec votre e-mail et votre mot de passe.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Adresse e-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-sky-500 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700 dark:bg-slate-800"
              placeholder="vous@exemple.fr"
            />
          </label>

          <label className="block text-sm font-medium">
            Mot de passe
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-sky-500 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700 dark:bg-slate-800"
              placeholder="••••••••"
            />
          </label>

          {status === 'erreur' && erreur && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'connexion'}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 disabled:opacity-60"
          >
            {status === 'connexion' ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}
