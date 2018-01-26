import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default [
  // browser-friendly UMD build
  {
    input: 'src/browser.js',
    external: ['react'],
    output: {
      name: 'htmr',
      file: 'lib/htmr.min.js',
      format: 'umd',
    },
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      commonjs({ include: 'node_modules/**' }),
      resolve(),
      uglify(),
    ],
  },
  // commonJS
  {
    input: 'src/server.js',
    external: ['posthtml-parser', 'react', 'html-entities'],
    output: [{ file: 'lib/index.js', format: 'cjs' }],
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
];
