// @flow
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import { hypenColonToCamelCase } from './utils';

export type Style = {
  [key: string]: number | string,
};

function convertProperty(prop: string): string {
  if (/^-ms-/.test(prop)) {
    // eslint-disable-next-line no-param-reassign
    prop = prop.substr(1);
  }

  return hypenColonToCamelCase(prop);
}

function convertValue(value: string): number | string {
  // pixel
  if (/^\d+px$/.test(value)) {
    return value.slice(0, value.length - 2);
  }

  return value.replace(/'/g, '"');
}

export default function convertStyle(styleStr: string): Style {
  const style = {};

  styleStr
    .replace(/&quot;/g, '"')
    .split(';')
    .filter(style => {
      const declaration = style.trim();
      return declaration !== '';
    })
    .forEach(declaration => {
      const rules = declaration.split(':');

      const prop = convertProperty(rules[0].trim());
      const val = convertValue(rules[1].trim());
      style[prop] = val;
    });

  return style;
}
