// @flow
import convertStyle from './convertStyle';

export type Attributes = {
  [key: string]: string,
};

// convert attr to valid react props
export default function mapAttribute(attrs: Attributes) {
  const props = {};

  for (const attr in attrs) {
    switch (attr) {
      case 'class':
        props.className = attrs[attr];
        break;
      case 'for':
        props.htmlFor = attrs[attr];
        break;
      case 'style':
        props.style = convertStyle(attrs[attr]);
        break;
      default:
        props[attr] = attrs[attr];
    }
  }

  return props;
}
