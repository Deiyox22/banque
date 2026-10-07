import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Suivi prospects — ELS Tech',
        short_name: 'ELS Tech',
        description: 'Tableau de bord de suivi de prospects pour ELS Tech',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Pas de mise en cache des appels Supabase par défaut (aucune règle
      // runtimeCaching ajoutée) : les données du tableau de bord doivent
      // toujours venir du réseau. Seuls les fichiers statiques de l'appli
      // (JS/CSS/HTML/icônes) sont précachés pour l'installation/démarrage
      // hors-ligne de la coquille applicative — pas les données elles-mêmes.
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
      },
    }),
  ],
});
