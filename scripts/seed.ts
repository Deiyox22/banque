import { config } from 'dotenv';
config();

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  readWorkbook,
  parseMaquettesSheet,
  parseProspectsSheet,
  mergeProspectData,
} from './parseSeedWorkbook';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, '..', 'seed');
const WORKBOOK_PATH = path.join(SEED_DIR, 'recap_maquettes_els_tech.xlsx');
const MAQUETTES_DIR = path.join(SEED_DIR, 'maquettes');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}. Voir .env.example.`);
  }
  return value;
}

const PHRASE_DESINSCRIPTION = 'Répondez STOP si vous ne souhaitez plus recevoir de messages de ma part.';

// Modèles prêts à l'emploi pour le premier envoi et la relance, sur les deux
// canaux. On ne les écrase jamais si Anthony les a déjà modifiés : on ne crée
// que ceux qui manquent (cf. "idempotent, relançable sans doublons").
const DEFAULT_TEMPLATES: Array<{ nom: string; canal: 'sms' | 'mail'; objet: string | null; corps: string }> = [
  {
    nom: 'Premier contact — SMS',
    canal: 'sms',
    objet: null,
    corps:
      "Bonjour, je vous ai préparé une proposition de site pour {{nom}} : {{lien_maquette}}\n" +
      "Dites-moi ce que vous en pensez !\n{{ma_signature}}",
  },
  {
    nom: 'Premier contact — Mail',
    canal: 'mail',
    objet: 'Votre proposition de site internet',
    corps:
      'Bonjour {{nom}},\n\n' +
      "Je me permets de vous contacter car j'ai préparé une proposition de site internet pour votre activité ({{activité}}).\n\n" +
      'Vous pouvez la consulter ici : {{lien_maquette}}\n\n' +
      "N'hésitez pas à me faire part de vos retours, je reste disponible pour en discuter.\n\n" +
      `{{ma_signature}}\n\n${PHRASE_DESINSCRIPTION}`,
  },
  {
    nom: 'Relance — SMS',
    canal: 'sms',
    objet: null,
    corps:
      'Bonjour {{nom}}, je reviens vers vous au sujet de la proposition de site que je vous avais envoyée ({{lien_maquette}}). ' +
      "Avez-vous eu l'occasion d'y jeter un œil ?\n{{ma_signature}}",
  },
  {
    nom: 'Relance — Mail',
    canal: 'mail',
    objet: 'Relance — votre proposition de site internet',
    corps:
      'Bonjour {{nom}},\n\n' +
      'Je me permets de revenir vers vous au sujet de la proposition de site internet que je vous avais transmise : {{lien_maquette}}\n\n' +
      "Si vous avez des questions ou souhaitez en discuter, n'hésitez pas à me contacter.\n\n" +
      `{{ma_signature}}\n\n${PHRASE_DESINSCRIPTION}`,
  },
];

async function seedTemplates(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: existants, error: lookupError } = await supabase
    .from('templates')
    .select('nom')
    .eq('user_id', userId);
  if (lookupError) throw lookupError;

  const nomsExistants = new Set((existants ?? []).map((t) => t.nom));
  const aCreer = DEFAULT_TEMPLATES.filter((t) => !nomsExistants.has(t.nom));
  if (aCreer.length === 0) return 0;

  const { error: insertError } = await supabase
    .from('templates')
    .insert(aCreer.map((t) => ({ ...t, user_id: userId })));
  if (insertError) throw insertError;
  return aCreer.length;
}

async function main() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  // auth.uid() n'existe pas pour ce script (pas de session utilisateur) : on
  // doit donc fournir explicitement le propriétaire des lignes importées.
  // C'est l'UUID du compte Anthony dans auth.users, visible dans le
  // dashboard Supabase (Authentication → Users) après sa première connexion.
  const userId = requireEnv('SEED_USER_ID');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (!fs.existsSync(WORKBOOK_PATH)) {
    throw new Error(`Classeur introuvable : ${WORKBOOK_PATH}`);
  }

  const workbook = readWorkbook(WORKBOOK_PATH);
  const maquettes = parseMaquettesSheet(workbook);
  const prospects = parseProspectsSheet(workbook);
  const merged = mergeProspectData(maquettes, prospects);

  console.log(`${merged.length} prospect(s) à importer depuis le classeur.`);

  let created = 0;
  let updated = 0;
  let mockupsCreated = 0;
  let mockupsUpdated = 0;
  let mockupsIgnores = 0;

  for (const entry of merged) {
    const { data: existing, error: lookupError } = await supabase
      .from('prospects')
      .select('id')
      .eq('user_id', userId)
      .ilike('nom', entry.nom)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const prospectPayload = {
      user_id: userId,
      nom: entry.nom,
      activite: entry.activite,
      localisation: entry.localisation,
      telephone: entry.telephone,
      email: entry.email,
      site_actuel: entry.site_actuel,
      priorite: entry.priorite,
      opportunite: entry.opportunite,
      accroche: entry.accroche,
      notes: entry.notes,
      // Une maquette est importée en même temps que la fiche : le statut de
      // départ reflète cet état réel, plutôt que la valeur brute du classeur
      // ("À contacter" / "À envoyer", écrite avant que ce tableau existe).
      statut: 'Maquette prête' as const,
    };

    let prospectId: string;

    if (existing) {
      const { error: updateError } = await supabase
        .from('prospects')
        .update(prospectPayload)
        .eq('id', existing.id);
      if (updateError) throw updateError;
      prospectId = existing.id;
      updated += 1;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('prospects')
        .insert(prospectPayload)
        .select('id')
        .single();
      if (insertError) throw insertError;
      prospectId = inserted.id;
      created += 1;
    }

    const filePath = path.join(MAQUETTES_DIR, entry.mockup.nom_fichier);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ Fichier introuvable pour "${entry.nom}" : ${filePath} — maquette ignorée.`);
      mockupsIgnores += 1;
      continue;
    }

    const storagePath = `${prospectId}/${entry.mockup.nom_fichier}`;
    const fileBuffer = fs.readFileSync(filePath);

    const { error: uploadError } = await supabase.storage
      .from('mockups')
      .upload(storagePath, fileBuffer, { contentType: 'text/html', upsert: true });
    if (uploadError) throw uploadError;

    const { data: existingMockup, error: mockupLookupError } = await supabase
      .from('mockups')
      .select('id')
      .eq('prospect_id', prospectId)
      .eq('nom_fichier', entry.mockup.nom_fichier)
      .maybeSingle();
    if (mockupLookupError) throw mockupLookupError;

    const mockupMetadata = {
      parcours_demo: entry.mockup.parcours_demo,
      identite_reprise: entry.mockup.identite_reprise,
      a_valider: entry.mockup.a_valider,
    };

    if (existingMockup) {
      const { error: mockupUpdateError } = await supabase
        .from('mockups')
        .update({ storage_path: storagePath, ...mockupMetadata })
        .eq('id', existingMockup.id);
      if (mockupUpdateError) throw mockupUpdateError;
      mockupsUpdated += 1;
    } else {
      const { error: mockupInsertError } = await supabase.from('mockups').insert({
        user_id: userId,
        prospect_id: prospectId,
        nom_fichier: entry.mockup.nom_fichier,
        version: 1,
        storage_path: storagePath,
        ...mockupMetadata,
      });
      if (mockupInsertError) throw mockupInsertError;
      mockupsCreated += 1;
    }
  }

  const templatesCreated = await seedTemplates(supabase, userId);

  console.log(
    `Terminé : ${created} prospect(s) créé(s), ${updated} mis à jour, ` +
      `${mockupsCreated} maquette(s) créée(s), ${mockupsUpdated} mise(s) à jour, ` +
      `${mockupsIgnores} ignorée(s) (fichier manquant), ` +
      `${templatesCreated} modèle(s) de message créé(s).`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Échec du seed :', message);
  process.exitCode = 1;
});
