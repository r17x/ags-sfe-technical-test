import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/ProductList.tsx',
      },
      library: { type: 'module' },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        '@chakra-ui/react': { singleton: true },
        '@emotion/react': { singleton: true },
      },
    }),
  ],
  server: { port: 3002 },
  preview: { port: 3002 },
  build: { target: 'esnext' },
});
