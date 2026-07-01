// Vite build and test configuration for the browser-only React frontend.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Keep browser targets aligned with the documented support matrix.
  build: {
    target: ['chrome109', 'edge109', 'firefox102', 'safari15'],
  },
  plugins: [react()],
  test: {
    // Coverage artifacts are generated locally/CI and ignored by source control.
    coverage: {
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: './coverage',
    },
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
