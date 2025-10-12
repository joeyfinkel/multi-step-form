/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MultiStepFormSharedUtils',
      fileName: 'index',
    },
  },
  plugins: [dts()],
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    globals: true,
  },
});
