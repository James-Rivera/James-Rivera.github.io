import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jamesrivera.dev',
  output: 'static',
  integrations: [react()],
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },
  build: {
    format: 'directory'
  }
});
