import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSession } from './lib/useSession';
import { Login } from './pages/Login';
import { AppShell } from './components/AppShell';
import { Pipeline } from './pages/Pipeline';
import { FicheProspect } from './pages/FicheProspect';
import { Maquettes } from './pages/Maquettes';

export function App() {
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
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Pipeline />} />
          <Route path="/prospects/:id" element={<FicheProspect />} />
          <Route path="/maquettes" element={<Maquettes />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
