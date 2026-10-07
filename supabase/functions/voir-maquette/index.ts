import { createClient } from 'npm:@supabase/supabase-js@2';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

// Sert le contenu d'une maquette à un prospect sans authentification, à
// partir de l'id du mockup (public, imprévisible — UUID généré en base).
// On passe par cette fonction plutôt que par une URL signée Supabase Storage
// directe pour deux raisons : (1) éviter un lien géant dans un SMS/mail (le
// token signé est un JWT de plusieurs centaines de caractères) ; (2) ne
// jamais stocker d'URL signée en base (elle expirerait) — ici l'accès est
// régénéré à chaque appel, avec la clé service_role, jamais exposée au
// client (voir CLAUDE.md).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id || !UUID_RE.test(id)) {
    return new Response('Lien invalide.', { status: 400, headers: CORS_HEADERS });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: mockup, error: lookupError } = await supabase
    .from('mockups')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();
  if (lookupError || !mockup) {
    return new Response('Maquette introuvable.', { status: 404, headers: CORS_HEADERS });
  }

  const { data: fichier, error: downloadError } = await supabase.storage.from('mockups').download(mockup.storage_path);
  if (downloadError || !fichier) {
    return new Response('Maquette introuvable.', { status: 404, headers: CORS_HEADERS });
  }

  // text/plain délibéré (jamais text/html) : si cette URL est ouverte
  // directement (hors de l'iframe sandboxée de /voir), le navigateur ne doit
  // jamais exécuter ce contenu tel quel — même logique que le Storage
  // Supabase lui-même (voir src/lib/mockupViewerUrl.ts).
  return new Response(await fichier.text(), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
  });
});
