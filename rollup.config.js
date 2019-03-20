import typescript2 from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/browser.ts',
    external: ['react'],
    output: {
      name: 'htmr',
      file: 'lib/htmr.min.js',
      format: 'umd',
      globals: {
        'react': 'React',
      }
    },
    plugins: [
      typescript2(),
      terser(),
      json(),
    ],
  },
  // commonJS
  {
    input: 'src/server.ts',
    external: ['posthtml-parser', 'react', 'html-entities'],
    output: [{ file: 'lib/index.js', format: 'cjs' }],
    plugins: [
      typescript2(),
      json(),
    ],
  },
];
