import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: ['posthtml-parser', 'react'],
  dest: 'lib/index.js',
};
