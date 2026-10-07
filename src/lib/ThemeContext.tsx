import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const CLE_STOCKAGE = 'els-tech-theme';

function lireThemeStocke(): boolean {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) === 'sombre';
  } catch {
    return false;
  }
}

interface ThemeContextValue {
  sombre: boolean;
  basculer: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mode sombre en option (clair par défaut, voir PRD.md), piloté par une
 * classe `.dark` sur `<html>` plutôt que par la préférence système, et
 * mémorisé dans `localStorage` (préférence propre à cet appareil).
 *
 * L'état vit ici, dans un seul Provider monté une fois dans `App.tsx` :
 * deux boutons de bascule (barre latérale desktop + en-tête mobile)
 * partagent ainsi le même état plutôt que d'avoir chacun leur propre
 * `useState` local, qui se désynchroniserait dès qu'on clique sur l'un
 * des deux.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
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

  return <ThemeContext.Provider value={{ sombre, basculer }}>{children}</ThemeContext.Provider>;
}

export function useDarkMode() {
  const contexte = useContext(ThemeContext);
  if (!contexte) {
    throw new Error('useDarkMode doit être utilisé à l\'intérieur de <ThemeProvider>.');
  }
  return contexte;
}
