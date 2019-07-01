/* global preval */
import convertStyle, { StyleObject } from './convertStyle';
import { hypenColonToCamelCase } from './utils';
import attributes from './attribute.json';

declare const preval: (str: TemplateStringsArray) => any;

export type RawAttributes = {
  [key: string]: string | number,
} & {
  style?: string
};

type AttributeMap = {
  [key: string]: string
}

type Attributes = {
  [key: string]: number | string | boolean | StyleObject,
}

const attributeMap = <AttributeMap>attributes;

// convert attr to valid react props
export default function mapAttribute(
  attrs = {} as RawAttributes,
  preserveAttributes: Array<String | RegExp>
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
      const preserved = preserveAttributes.filter(at => {
        if (at instanceof RegExp) {
          return at.test(attr);
        }

        return at === attr;
      });

      if (preserved.length === 0) {
        attributeName = hypenColonToCamelCase(attr);
      }
    }

    const name = attributeMap[attributeName] || attributeName;
    if (name === 'style') {
      // if there's an attribute called style, this means that the value must be exists
      // even if it's an empty string
      result[name] = convertStyle(attrs.style!);
    } else {
      const value = attrs[attr]
      // Convert attribute value to boolean attribute if needed
      // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
      const isBooleanAttribute = value === '' || String(value).toLowerCase() === attributeName.toLowerCase();
      result[name] = isBooleanAttribute ? true : value;
    }

    return result;
  }, {} as Attributes);
}
