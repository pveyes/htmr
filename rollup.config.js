import babel from 'rollup-plugin-babel';
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
    format: 'umd',
    globals: {
      react: 'React',
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
    dest: 'lib/htmr.min.js',
  },
];
