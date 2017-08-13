// Custom source transformer for babel-jest.
// We use this because rollup uses .babelrc for tree shaking and
// jest needs cjs module
const babel = require('babel-core');

module.exports = {
  process(src, path) {
    return babel.transform(src, {
      babelrc: false,
      presets: ['env', 'react'],
      plugins: ['preval', 'transform-object-rest-spread'],
    });
  },
};
