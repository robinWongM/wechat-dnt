import nodeExternals from 'rollup-plugin-node-externals'
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'backend',
      fileName: 'main',
      formats: ['es'],
    },
  },
  plugins: [
    nodeExternals({
      builtins: true,
      deps: false,
      devDeps: true,
    }),
  ],
});
