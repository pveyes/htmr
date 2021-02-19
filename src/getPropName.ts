import attributes from './attribute.json';
import { HTMLTags } from './types';

type AttributeMap = Record<string, string>
const attrs = <AttributeMap>attributes;

export default function getPropName(_originalTag: HTMLTags, attributeName: string) {
  return attrs[attributeName] || attributeName
}
