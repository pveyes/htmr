// @flow
/* global preval */
import convertStyle from './convertStyle';

export type Attributes = {
  [key: string]: string,
};

// only includes attribute that needs mapping
// credits: https://github.com/noraesae/react-attr-converter/blob/master/index.js
const attributeMap = preval`
  const map = JSON.parse(
    require('fs').readFileSync(
      require('path').resolve(
        process.cwd(),
        './src/attribute.json',
      )
    )
  );

  const attributeMap = Object
    .keys(map)
    .reduce((result, attr) => {
      if (attr !== map[attr]) {
        result[attr] = map[attr];
      }

      return result;
    }, {});

  attributeMap.dname = __dirname;
  module.exports = attributeMap;
`;

// convert attr to valid react props
export default function mapAttribute(attrs: Attributes = {}) {
  return Object.keys(attrs).reduce((result, attr) => {
    // ignore event attribute
    if (/^on.*/.test(attr)) {
      return result;
    }

    const name = attributeMap[attr] || attr;
    if (name === 'style') {
      result[name] = convertStyle(attrs[attr]);
    } else {
      result[name] = attrs[attr];
    }
    return result;
  }, {});
}
