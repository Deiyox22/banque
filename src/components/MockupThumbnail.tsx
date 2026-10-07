import { useMockupHtml } from '../lib/useMockupHtml';

export function MockupThumbnail({ storagePath }: { storagePath: string }) {
  const { html, error } = useMockupHtml(storagePath);

  return (
    <div className="h-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800">
      {error ? (
        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-red-600 dark:text-red-400">
          Aperçu indisponible
        </div>
      ) : html ? (
        <iframe
          sandbox="allow-scripts"
          title="Vignette de la maquette"
          srcDoc={html}
          tabIndex={-1}
          className="pointer-events-none h-[700px] w-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">Chargement…</div>
      )}
    </div>
  );
}
