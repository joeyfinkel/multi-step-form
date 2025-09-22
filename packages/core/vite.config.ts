/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MultiStepFormCore',
      fileName: 'multi-step-form-core',
    },
  },
  plugins: [dts()],
  test: {
    globals: true,
  },
});
