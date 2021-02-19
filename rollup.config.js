import typescript2 from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.browser.ts',
    external: ['react'],
    output: {
      name: 'htmr',
      file: 'lib/htmr.browser.js',
      format: 'umd',
      globals: {
        react: 'React',
      },
    },
    plugins: [typescript2(), terser(), json()],
  },
  // commonJS
  {
    input: 'src/index.ts',
    external: ['htmlparser2', 'react', 'html-entities'],
    output: [{ file: 'lib/htmr.js', format: 'cjs' }],
    plugins: [typescript2(), json()],
  },
];
