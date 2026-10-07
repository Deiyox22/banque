import type { ChangeEvent } from 'react';
import { useMockups } from '../lib/useMockups';
import { useUploadMockupVersion } from '../lib/useUploadMockupVersion';
import { MaquetteCard } from '../components/MaquetteCard';

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
            <MaquetteCard
              key={mockup.id}
              mockup={mockup}
              uploading={uploadingProspectId === mockup.prospect.id}
              onFileChange={(event) => handleFileChange(mockup.prospect.id, mockup.version, event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
