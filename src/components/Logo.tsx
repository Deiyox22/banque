// Le logo est un lockup complet (icône + texte "ELS TECH" intégrés à
// l'image) : on ne lui accole pas de texte à côté, sous peine de doublon.
export function Logo({ taille = 'h-9 w-9' }: { taille?: string }) {
  return <img src="/logo.png" alt="ELS Tech" className={`${taille} shrink-0 rounded-full`} />;
}
