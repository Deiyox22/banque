// Supabase sert délibérément les fichiers HTML du bucket Storage en
// `Content-Type: text/plain` + CSP verrouillée, même via une URL signée
// (protection anti-XSS intégrée à la plateforme, pas un bug de notre
// configuration) : un lien Supabase direct s'affiche comme du code source,
// jamais comme une vraie page. On partage donc un lien court vers notre
// propre route publique `/voir/:id`, qui passe par l'Edge Function
// `voir-maquette` pour récupérer le contenu et le servir avec les bons
// en-têtes — jamais l'URL Supabase brute, et jamais le JWT signé (illisible
// et bien trop long pour un SMS) directement dans le lien partagé.
export function lienAffichageMaquette(mockupId: string): string {
  return `${window.location.origin}/voir/${mockupId}`;
}
