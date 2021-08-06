import { HTMLTags } from './types';

export type RawAttributes = {
  [key: string]: string | number;
} & {
  style?: string;
};

type Attributes = Record<string, number | string | boolean | StyleObject>;

// convert attr to valid react props
export default function mapAttribute(
  originalTag: HTMLTags,
  attrs = {} as RawAttributes,
  preserveAttributes: Array<String | RegExp>,
  getPropInfo: (
    originalTag: HTMLTags,
    attributeName: string
  ) => { name: string; isBoolean: boolean }
): Attributes {
  return Object.keys(attrs).reduce((result, attr) => {
    // ignore inline event attribute
    if (/^on.*/.test(attr)) {
      return result;
    }

    // Convert attribute to camelCase except data-* and aria-* attribute
    // https://facebook.github.io/react/docs/dom-elements.html
    let attributeName = attr;
    if (!/^(data|aria)-/.test(attr)) {
      // Allow preserving non-standard attribute, e.g: `ng-if`
      const preserved = preserveAttributes.filter((at) => {
        if (at instanceof RegExp) {
          return at.test(attr);
        }

        return at === attr;
      });

      if (preserved.length === 0) {
        attributeName = hypenColonToCamelCase(attr);
      }
    }

    const prop = getPropInfo(originalTag, attributeName);
    if (prop.name === 'style') {
      // if there's an attribute called style, this means that the value must be exists
      // even if it's an empty string
      result[prop.name] = convertStyle(attrs.style!);
    } else {
      const value = attrs[attr];
      // Convert attribute value to boolean attribute if needed
      // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
      const booleanAttrributeValue =
        value === '' ||
        String(value).toLowerCase() === attributeName.toLowerCase();
      result[prop.name] = prop.isBoolean ? booleanAttrributeValue : value;
    }

    return result;
  }, {} as Attributes);
}

type StyleObject = Record<string, number | string>;

function convertProperty(prop: string): string {
  if (/^-ms-/.test(prop)) {
    // eslint-disable-next-line no-param-reassign
    prop = prop.substr(1);
  }

  // keep CSS custom properties as is
  if (prop.startsWith('--')) {
    return prop;
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

function convertStyle(styleStr: string): StyleObject {
  const style = {} as StyleObject;

  styleStr
    .split(';')
    // non-empty declaration
    .filter((style) => style.trim() !== '')
    .forEach((declaration) => {
      const rules = declaration.split(':');
      if (rules.length > 1) {
        const prop = convertProperty(rules[0].trim());
        // handle url: attribute on style
        const val = convertValue(rules.slice(1).join(':').trim());
        style[prop] = val;
      }
    });

  return style;
}

function hypenColonToCamelCase(str: string): string {
  // convert hypen and colon to camel case
  // color-profile -> colorProfile
  // xlink:role -> xlinkRole
  return str.replace(/(-|:)(.)/g, (match, symbol, char) => {
    return char.toUpperCase();
  });
}
