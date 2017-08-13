// @flow
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
export type Style = {
  [key: string]: number | string,
};

function convertProperty(prop: string): string {
  if (/^-ms-/.test(prop)) {
    // eslint-disable-next-line no-param-reassign
    prop = prop.substr(1);
  }

  // convert hypen to camel case
  return prop.replace(/-(.)/g, (match, chr) => {
    return chr.toUpperCase();
  });
}

function convertValue(value: string): number | string {
  // pixel
  if (/^\d+px$/.test(value)) {
    return value.slice(0, value.length - 2);
  }

  return `'${value.replace(/'/g, '"')}'`;
}

export default function convertStyle(styleStr: string): Style {
  const style = {};

  styleStr
    .split(';')
    .filter(style => {
      const declaration = style.trim();
      return declaration !== '';
    })
    .forEach(declaration => {
      const [property, value] = declaration.split(':');

      const prop = convertProperty(property.trim());
      const val = convertValue(value.trim());
      style[prop] = val;
    });

  return style;
}
