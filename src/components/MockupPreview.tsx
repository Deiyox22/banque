import { useState } from 'react';
import { useMockupHtml } from '../lib/useMockupHtml';
import { lienAffichageMaquette } from '../lib/mockupViewerUrl';

type Taille = 'mobile' | 'ordinateur';

export function MockupPreview({ mockupId }: { mockupId: string }) {
  const { html, error } = useMockupHtml(mockupId);
  const [taille, setTaille] = useState<Taille>('mobile');

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 text-xs dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTaille('mobile')}
            className={`rounded-md px-2.5 py-1 font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 ${
              taille === 'mobile' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setTaille('ordinateur')}
            className={`rounded-md px-2.5 py-1 font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 ${
              taille === 'ordinateur' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Ordinateur
          </button>
        </div>
        <a
          href={lienAffichageMaquette(mockupId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          Ouvrir dans un nouvel onglet ↗
        </a>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!error && (
        <div
          className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800"
          style={{ width: taille === 'mobile' ? 375 : '100%', maxWidth: '100%' }}
        >
          {html ? (
            // allow-scripts seul (jamais allow-same-origin avec du HTML non fiable) :
            // le contenu reste isolé dans une origine opaque, sans accès au reste de l'app.
            <iframe sandbox="allow-scripts" title="Aperçu de la maquette" srcDoc={html} className="h-[600px] w-full" />
          ) : (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">Chargement de l'aperçu…</p>
          )}
        </div>
      )}
    </div>
  );
}
