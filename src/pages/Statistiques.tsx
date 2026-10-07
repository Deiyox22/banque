import { Link } from 'react-router-dom';
import { useStatistiques } from '../lib/useStatistiques';
import { TYPE_ACTIVITE_LABELS } from '../lib/activiteLabels';
import { formatDate } from '../lib/formatDate';
import { STATUTS } from '../components/StatutBadge';

function Barre({ label, valeur, total }: { label: string; valeur: number; total: number }) {
  const pourcentage = total > 0 ? Math.round((valeur / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {valeur} <span className="text-xs text-slate-500 dark:text-slate-400">({pourcentage}%)</span>
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}

function Carte({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{titre}</p>
      <p className="mt-1 text-xl font-semibold">{valeur}</p>
    </div>
  );
}

export function Statistiques() {
  const { statistiques, loading, error } = useStatistiques();

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>;
  }

  if (error || !statistiques) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        {error ?? 'Statistiques indisponibles.'}
      </p>
    );
  }

  const { entonnoir, tauxReponse, delaiMoyenReponseJours, repartitionStatut, repartitionTypeActivite, sansReponseDepuis10Jours } =
    statistiques;
  const totalEntonnoir = entonnoir.contactes || 1;
  const totalProspects = repartitionStatut.reduce((somme, r) => somme + r.nombre, 0) || 1;
  const totalActivites = repartitionTypeActivite.reduce((somme, r) => somme + r.nombre, 0) || 1;

  return (
    <div>
      <h1 className="text-lg font-semibold">Statistiques</h1>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Entonnoir</h2>
        <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Barre label="Contactés" valeur={entonnoir.contactes} total={totalEntonnoir} />
          <Barre label="Vus" valeur={entonnoir.vus} total={totalEntonnoir} />
          <Barre label="Réponses" valeur={entonnoir.reponses} total={totalEntonnoir} />
          <Barre label="Intéressés" valeur={entonnoir.interesses} total={totalEntonnoir} />
          <Barre label="Gagnés" valeur={entonnoir.gagnes} total={totalEntonnoir} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Carte titre="Taux de réponse" valeur={tauxReponse === null ? '—' : `${Math.round(tauxReponse * 100)}%`} />
        <Carte
          titre="Délai moyen de réponse"
          valeur={delaiMoyenReponseJours === null ? '—' : `${delaiMoyenReponseJours.toFixed(1)} j`}
        />
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Répartition par statut</h2>
        <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          {STATUTS.map((statut) => {
            const entree = repartitionStatut.find((r) => r.statut === statut);
            return <Barre key={statut} label={statut} valeur={entree?.nombre ?? 0} total={totalProspects} />;
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Répartition par type d'activité</h2>
        {repartitionTypeActivite.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune activité enregistrée pour le moment.</p>
        ) : (
          <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            {repartitionTypeActivite.map((entree) => (
              <Barre
                key={entree.type}
                label={TYPE_ACTIVITE_LABELS[entree.type]}
                valeur={entree.nombre}
                total={totalActivites}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 mb-6">
        <h2 className="mb-2 text-sm font-semibold">
          Sans réponse depuis 10+ jours ({sansReponseDepuis10Jours.length})
        </h2>
        {sansReponseDepuis10Jours.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Rien à signaler.
          </p>
        ) : (
          <div className="space-y-2">
            {sansReponseDepuis10Jours.map(({ prospect, joursDepuisDernierContact }) => (
              <Link
                key={prospect.id}
                to={`/prospects/${prospect.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <span className="font-medium">{prospect.nom}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {joursDepuisDernierContact} j (depuis le {formatDate(prospect.updated_at)})
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
