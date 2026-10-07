import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAujourdhui } from '../lib/useAujourdhui';
import { PriorityBadge } from '../components/PriorityBadge';
import { formatDate } from '../lib/formatDate';
import type { Prospect } from '../types/database';

function Section({ titre, vide, children }: { titre: string; vide: boolean; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-sm font-semibold">{titre}</h2>
      {vide ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Rien à signaler.
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  );
}

function ProspectRow({ prospect, info }: { prospect: Prospect; info?: string }) {
  return (
    <Link
      to={`/prospects/${prospect.id}`}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <span>
        <span className="font-medium">{prospect.nom}</span>
        {info && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{info}</span>}
      </span>
      <PriorityBadge priorite={prospect.priorite} />
    </Link>
  );
}

export function Aujourdhui() {
  const { aFinaliser, aContacter, relances, nouvellesReponses, loading, error } = useAujourdhui();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-lg font-semibold">Aujourd'hui</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <div className="mt-6">
          <Section titre={`Nouvelles réponses (${nouvellesReponses.length})`} vide={nouvellesReponses.length === 0}>
            {nouvellesReponses.map((reponse) => (
              <Link
                key={reponse.id}
                to={`/prospects/${reponse.prospect.id}`}
                className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="font-medium">{reponse.prospect.nom}</span>
                {reponse.contenu && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{reponse.contenu}</p>
                )}
              </Link>
            ))}
          </Section>

          <Section titre={`Relances en retard ou du jour (${relances.length})`} vide={relances.length === 0}>
            {relances.map((prospect) => (
              <ProspectRow
                key={prospect.id}
                prospect={prospect}
                info={
                  prospect.prochaine_relance && prospect.prochaine_relance < aujourdhui
                    ? `en retard depuis le ${formatDate(prospect.prochaine_relance)}`
                    : "aujourd'hui"
                }
              />
            ))}
          </Section>

          <Section titre={`À contacter (${aContacter.length})`} vide={aContacter.length === 0}>
            {aContacter.map((prospect) => (
              <ProspectRow key={prospect.id} prospect={prospect} />
            ))}
          </Section>

          <Section titre={`Maquettes à finaliser (${aFinaliser.length})`} vide={aFinaliser.length === 0}>
            {aFinaliser.map((prospect) => (
              <ProspectRow key={prospect.id} prospect={prospect} />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}
