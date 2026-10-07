import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSession } from './lib/useSession';
import { ThemeProvider } from './lib/ThemeContext';
import { Login } from './pages/Login';
import { AppShell } from './components/AppShell';
import { Aujourdhui } from './pages/Aujourdhui';
import { Pipeline } from './pages/Pipeline';
import { FicheProspect } from './pages/FicheProspect';
import { Maquettes } from './pages/Maquettes';
import { Messages } from './pages/Messages';
import { Statistiques } from './pages/Statistiques';
import { Parametres } from './pages/Parametres';
import { VoirMaquette } from './pages/VoirMaquette';

// /voir/:id est publique (un prospect externe l'ouvre depuis un message
// reçu, sans compte) : elle doit rester accessible même sans session, donc
// hors de la logique d'authentification ci-dessous.
function AppAuthentifiee() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      </main>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Aujourdhui />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/prospects/:id" element={<FicheProspect />} />
        <Route path="/maquettes" element={<Maquettes />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/voir/:id" element={<VoirMaquette />} />
          <Route path="/*" element={<AppAuthentifiee />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
