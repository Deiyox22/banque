import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMockupHtml } from '../lib/useMockupHtml';
import { lienAffichageMaquette } from '../lib/mockupViewerUrl';
import { MockupThumbnail } from './MockupThumbnail';
import { StatutBadge } from './StatutBadge';
import { formatDate } from '../lib/formatDate';
import type { MockupAvecProspect } from '../lib/useMockups';

export function MaquetteCard({
  mockup,
  uploading,
  onFileChange,
}: {
  mockup: MockupAvecProspect;
  uploading: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const { html, error } = useMockupHtml(mockup.id);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/prospects/${mockup.prospect.id}`}>
        <MockupThumbnail html={html} error={error} />
      </Link>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/prospects/${mockup.prospect.id}`}
            className="font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            {mockup.prospect.nom}
          </Link>
          <a
            href={lienAffichageMaquette(mockup.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            Ouvrir ↗
          </a>
        </div>
        <div className="mt-1">
          <StatutBadge statut={mockup.prospect.statut} />
        </div>
        {mockup.parcours_demo && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Parcours démo : {mockup.parcours_demo}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          Version {mockup.version} · {formatDate(mockup.created_at)}
        </p>
      </div>

      <label className="mt-3 block text-xs">
        <span className="text-slate-500 dark:text-slate-400">Téléverser une nouvelle version</span>
        <input
          type="file"
          accept=".html,text/html"
          disabled={uploading}
          onChange={onFileChange}
          className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400"
        />
      </label>
      {uploading && <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">Envoi en cours…</p>}
    </div>
  );
}
