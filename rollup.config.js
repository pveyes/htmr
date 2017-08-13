import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default [
  // cjs
  {
    entry: 'src/server.js',
    format: 'cjs',
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    external: ['posthtml-parser', 'react'],
    dest: 'lib/index.js',
  },
  // umd
  {
    entry: 'src/browser.js',
    format: 'iife',
    globals: {
      react: 'React',
    },
    plugins: [
      json(),
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
    dest: 'lib/htmr.min.js',
  },
];
