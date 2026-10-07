import { analyserTelephone, lienRechercheFacebook } from '../lib/contact';
import type { Prospect } from '../types/database';

const BOUTON = 'shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700';

export function ContactCard({ prospect }: { prospect: Prospect }) {
  const contact = analyserTelephone(prospect.telephone, prospect.nom);

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Contact
      </h2>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {contact.viaFacebook ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <span aria-hidden="true">📘</span>
              <span className="truncate">{prospect.telephone}</span>
            </span>
            <a
              href={lienRechercheFacebook(contact.nomFacebook!)}
              target="_blank"
              rel="noopener noreferrer"
              className={BOUTON}
            >
              Ouvrir
            </a>
          </div>
        ) : prospect.telephone ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <span aria-hidden="true">📞</span>
              <span className="truncate">{prospect.telephone}</span>
            </span>
            <div className="flex shrink-0 gap-1.5">
              <a href={`tel:${prospect.telephone.replace(/\s+/g, '')}`} className={BOUTON}>
                Appeler
              </a>
              <a href={`sms:${prospect.telephone.replace(/\s+/g, '')}`} className={BOUTON}>
                SMS
              </a>
            </div>
          </div>
        ) : (
          <p className="py-2 text-sm text-slate-400">📞 Pas de téléphone renseigné</p>
        )}

        {prospect.email ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <span aria-hidden="true">✉️</span>
              <span className="truncate">{prospect.email}</span>
            </span>
            <a href={`mailto:${prospect.email}`} className={BOUTON}>
              Mail
            </a>
          </div>
        ) : (
          <p className="py-2 text-sm text-slate-400">✉️ Pas d'e-mail renseigné</p>
        )}
      </div>
    </div>
  );
}
