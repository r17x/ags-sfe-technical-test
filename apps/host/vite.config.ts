import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        products: {
          type: 'module',
          name: 'products',
          entry: 'http://localhost:3002/remoteEntry.js',
        }
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        '@chakra-ui/react': { singleton: true },
        '@emotion/react': { singleton: true },
      },
    }),
  ],
  server: { port: 3001 },
  preview: { port: 3001 },
  build: { target: 'esnext' },
});
