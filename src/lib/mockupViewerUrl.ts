// Supabase sert délibérément les fichiers HTML du bucket Storage en
// `Content-Type: text/plain` + CSP verrouillée, même via une URL signée
// (protection anti-XSS intégrée à la plateforme, pas un bug de notre
// configuration) : un lien Supabase direct s'affiche comme du code source,
// jamais comme une vraie page. On fait donc transiter l'affichage par notre
// propre route publique (`/voir`), qui récupère le contenu et le sert avec
// les bons en-têtes — c'est elle que l'on partage, jamais l'URL Supabase brute.
export function lienAffichageMaquette(urlSignee: string): string {
  return `${window.location.origin}/voir?u=${encodeURIComponent(urlSignee)}`;
}
