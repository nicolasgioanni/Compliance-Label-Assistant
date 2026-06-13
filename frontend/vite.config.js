import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    target: ['chrome109', 'edge109', 'firefox102', 'safari15'],
  },
  plugins: [react()],
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: './coverage',
    },
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
