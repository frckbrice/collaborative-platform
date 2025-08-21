import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'tests/**/*',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'tests/**/*',
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
