// @flow
/* global preval */
import convertStyle from './convertStyle';
import { hypenColonToCamelCase } from './utils';

type Attributes = {
  [key: string]: string,
};

// only includes attribute that needs mapping (lowercase -> camelCase)
// credits: https://github.com/noraesae/react-attr-converter/blob/master/index.js
const attributeMap: Object = preval`
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

  module.exports = attributeMap;
`;

// convert attr to valid react props
export default function mapAttribute(attrs: Attributes = {}) {
  return Object.keys(attrs).reduce((result, attr) => {
    // ignore inline event attribute
    if (/^on.*/.test(attr)) {
      return result;
    }

    // Convert attribute to camelCase except data-* and aria-* attribute
    // https://facebook.github.io/react/docs/dom-elements.html
    let attributeName = attr;
    if (!/^(data|aria)-/.test(attr)) {
      attributeName = hypenColonToCamelCase(attr);
    }

    const name = attributeMap[attributeName] || attributeName;
    if (name === 'style') {
      result[name] = convertStyle(attrs[attributeName]);
    } else {
      result[name] = attrs[attributeName];
    }

    return result;
  }, {});
}
