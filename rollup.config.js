import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default [
  // cjs
  {
    input: 'src/server.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    external: ['posthtml-parser', 'react', 'html-entities'],
  },
  // umd
  {
    input: 'src/browser.js',
    output: {
      file: 'lib/htmr.min.js',
      format: 'umd',
      globals: {
        react: 'React',
      },
    },
    plugins: [
      resolve({
        jsnext: false,
        main: true,
        browser: true,
      }),
      commonjs({
        ignoreGlobal: true,
        include: 'node_modules/**',
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      uglify(),
    ],
    external: ['react'],
  },
];
