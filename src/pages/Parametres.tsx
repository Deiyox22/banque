import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useParametres } from '../lib/useParametres';
import { useImportExportProspects } from '../lib/useImportExportProspects';

export function Parametres() {
  const { delaiRelanceJours, signature, loading, error, enregistrer } = useParametres();
  const { exporter, importer, exporting, importing, error: csvError } = useImportExportProspects();

  const [delai, setDelai] = useState(delaiRelanceJours);
  const [sig, setSig] = useState(signature);
  const [dirty, setDirty] = useState(false);
  const [statutEnregistrement, setStatutEnregistrement] = useState<'idle' | 'enregistrement' | 'enregistré' | 'erreur'>(
    'idle'
  );
  const [erreurEnregistrement, setErreurEnregistrement] = useState<string | null>(null);
  const [resultatImport, setResultatImport] = useState<string | null>(null);

  // Garde le formulaire synchronisé avec les données chargées, sauf pendant
  // une saisie en cours (même pattern que les notes de la Fiche prospect).
  if (!loading && !dirty && (delai !== delaiRelanceJours || sig !== signature)) {
    setDelai(delaiRelanceJours);
    setSig(signature);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDirty(false);
    setStatutEnregistrement('enregistrement');
    setErreurEnregistrement(null);

    const { error: saveError } = await enregistrer({ delai_relance_jours: delai, signature: sig.trim() || null });
    if (saveError) {
      setStatutEnregistrement('erreur');
      setErreurEnregistrement(saveError);
      return;
    }
    setStatutEnregistrement('enregistré');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setResultatImport(null);
    const contenu = await file.text();
    const resultat = await importer(contenu);
    if (resultat) {
      setResultatImport(`${resultat.crees} créé(s), ${resultat.misAJour} mis à jour.`);
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Paramètres</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <label className="block text-sm font-medium">
          Délai de relance (jours)
          <input
            type="number"
            min={1}
            required
            value={delai}
            onChange={(event) => {
              setDelai(Number(event.target.value));
              setDirty(true);
            }}
            className="mt-1 block w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <label className="block text-sm font-medium">
          Signature
          <textarea
            rows={3}
            value={sig}
            onChange={(event) => {
              setSig(event.target.value);
              setDirty(true);
            }}
            placeholder="Anthony — ELS Tech"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        {erreurEnregistrement && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {erreurEnregistrement}
          </p>
        )}

        <button
          type="submit"
          disabled={statutEnregistrement === 'enregistrement'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-60"
        >
          {statutEnregistrement === 'enregistrement'
            ? 'Enregistrement…'
            : statutEnregistrement === 'enregistré'
              ? 'Enregistré ✓'
              : 'Enregistrer'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Données</h2>
        <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={exporter}
            disabled={exporting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-60 dark:border-slate-700"
          >
            {exporting ? 'Export…' : 'Exporter les prospects (CSV)'}
          </button>

          <label className="block text-sm font-medium">
            Importer un CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleImport}
              disabled={importing}
              className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400"
            />
          </label>

          {importing && <p className="text-sm text-slate-500 dark:text-slate-400">Import en cours…</p>}
          {resultatImport && (
            <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">
              {resultatImport}
            </p>
          )}
          {csvError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {csvError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
