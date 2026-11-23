import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), legacy()],
  test: {
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',

    include: ['src/**/*.test.{ts,tsx}'],
  },
});
