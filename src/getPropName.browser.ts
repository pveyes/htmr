import { HTMLTags } from './types';

const specialPropsMap: Record<string,string> = {
  'for': 'htmlFor',
  'class': 'className',
  // DOM property uses allowFullscreen instead
  'allowfullscreen': 'allowFullScreen',
};

/**
 * In browser we can get equivalent React props by creating a temporary DOM node,
 * and iterating over its properties. This means we don't have to ship entire
 * HTML attributes mapping to React props.
 * 
 * For other edge cases we can use specialPropsMaps
 */
export default function getPropName(originalTag: HTMLTags, attributeName: string): string {
  // handle edge cases first
  if (specialPropsMap[attributeName]) {
    return specialPropsMap[attributeName]
  }

  const el = document.createElement(originalTag);
  if (attributeName in el) {
    return attributeName;
  }

  for (let propName in el) {
    if (propName.toLowerCase() === attributeName.toLowerCase()) {
      return propName;
    }
  }

  return attributeName;
}
