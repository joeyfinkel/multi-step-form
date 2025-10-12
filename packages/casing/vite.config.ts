import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MultiStepFormCasing',
      fileName: 'index',
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [dts()],
});
