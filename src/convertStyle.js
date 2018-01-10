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
  // value can be converted to pixel automatically by converting it to number
  if (/^\d+$/.test(value)) {
    return Number(value);
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
      if (rules.length > 1) {
        const prop = convertProperty(rules[0].trim());
        //To handle url: attribute on style
        const val = convertValue(
          rules
            .slice(1)
            .join(':')
            .trim()
        );
        style[prop] = val;
      }
    });

  return style;
}
