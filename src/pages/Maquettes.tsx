import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMockups } from '../lib/useMockups';
import { useUploadMockupVersion } from '../lib/useUploadMockupVersion';
import { MockupThumbnail } from '../components/MockupThumbnail';
import { StatutBadge } from '../components/StatutBadge';
import { formatDate } from '../lib/formatDate';

export function Maquettes() {
  const { mockups, loading, error, refetch } = useMockups();
  const { uploadNewVersion, uploadingProspectId, error: uploadError } = useUploadMockupVersion();

  async function handleFileChange(prospectId: string, version: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const ok = await uploadNewVersion(prospectId, version, file);
    if (ok) refetch();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Maquettes</h1>

      {(error || uploadError) && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error ?? uploadError}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : mockups.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucune maquette pour le moment.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockups.map((mockup) => (
            <div key={mockup.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Link to={`/prospects/${mockup.prospect.id}`}>
                <MockupThumbnail storagePath={mockup.storage_path} />
              </Link>

              <div className="mt-3">
                <Link
                  to={`/prospects/${mockup.prospect.id}`}
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {mockup.prospect.nom}
                </Link>
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
                  disabled={uploadingProspectId === mockup.prospect.id}
                  onChange={(event) => handleFileChange(mockup.prospect.id, mockup.version, event)}
                  className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400"
                />
              </label>
              {uploadingProspectId === mockup.prospect.id && (
                <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">Envoi en cours…</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
