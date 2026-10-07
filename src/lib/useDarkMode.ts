import { useCallback, useEffect, useState } from 'react';

const CLE_STOCKAGE = 'els-tech-theme';

function lireThemeStocke(): boolean {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) === 'sombre';
  } catch {
    return false;
  }
}

/**
 * Mode sombre en option (clair par défaut, voir PRD.md), piloté par une
 * classe `.dark` sur `<html>` plutôt que par la préférence système, et
 * mémorisé dans `localStorage` (préférence propre à cet appareil).
 */
export function useDarkMode() {
  const [sombre, setSombre] = useState(lireThemeStocke);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', sombre);
    try {
      window.localStorage.setItem(CLE_STOCKAGE, sombre ? 'sombre' : 'clair');
    } catch {
      // stockage indisponible (navigation privée, etc.) : le réglage reste
      // actif pour la session en cours, simplement pas mémorisé.
    }
  }, [sombre]);

  const basculer = useCallback(() => setSombre((valeur) => !valeur), []);

  return { sombre, basculer };
}
