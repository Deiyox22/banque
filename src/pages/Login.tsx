import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'envoi' | 'envoyé' | 'erreur'>('idle');
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('envoi');
    setErreur(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setStatus('erreur');
      setErreur(error.message);
      return;
    }

    setStatus('envoyé');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold">Suivi prospects — ELS Tech</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Connectez-vous avec votre e-mail : vous recevrez un lien de connexion.
        </p>

        {status === 'envoyé' ? (
          <p
            role="status"
            className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            Lien envoyé à {email}. Ouvrez-le depuis cet appareil pour vous connecter.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Adresse e-mail
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:border-slate-700 dark:bg-slate-800"
                placeholder="vous@exemple.fr"
              />
            </label>

            {status === 'erreur' && erreur && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'envoi'}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-60"
            >
              {status === 'envoi' ? 'Envoi en cours…' : 'Recevoir le lien de connexion'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
