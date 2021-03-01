/* eslint-env browser */
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import React, { ReactNode } from 'react';
import mapAttribute, { RawAttributes } from './mapAttribute';
import { HtmrOptions, HTMLTags } from './types';

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
const NodeTypes = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8,
};

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function transform(node: any, key: string, options: HtmrOptions): ReactNode {
  const defaultTransform = options.transform._;

  if (node.nodeType === NodeTypes.COMMENT) {
    return null;
  } else if (node.nodeType === NodeTypes.TEXT) {
    const text = node.textContent;
    return defaultTransform ? defaultTransform(text) : text;
  }

  // element
  const tag = node.tagName.toLowerCase() as HTMLTags;
  const customElement = options.transform[tag];

  const attrs: RawAttributes = {};
  for (let i = 0; i < node.attributes.length; i++) {
    const key = node.attributes[i].name;
    const value = node.attributes[i].value;
    attrs[key] = value;
  }

  attrs.key = key.toString();
  const props = mapAttribute(attrs, options.preserveAttributes);

  let children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const childNode = node.childNodes[i];
    const childKey = `${key}.${i}`;

    if (
      TABLE_ELEMENTS.indexOf(tag) > -1 &&
      childNode.nodeType === NodeTypes.TEXT
    ) {
      childNode.textContent = childNode.textContent.trim();
      if (childNode.textContent === '') {
        continue;
      }
    }

    const component = transform(childNode, childKey, options);
    if (component !== null) {
      children.push(component);
    }
  }

  if (options.dangerouslySetChildren.indexOf(tag) > -1) {
    let html = node.innerHTML;

    // Script tag can have empty children
    if (html) {
      // we need to preserve quote inside style declaration
      if (tag !== 'style' && tag !== 'script') {
        html = html.replace(/"/g, '&quot;');
      }
      props.dangerouslySetInnerHTML = { __html: html.trim() };
    }

    return customElement
      ? React.createElement(customElement as any, props, null)
      : defaultTransform
      ? defaultTransform(tag, props, null)
      : React.createElement(tag, props, null);
  }

  // self closing tag shouldn't have children
  const reactChildren = children.length === 0 ? null : children;

  if (customElement) {
    return React.createElement(customElement as any, props, reactChildren);
  }

  if (defaultTransform) {
    return defaultTransform(tag, props, reactChildren);
  }

  return React.createElement(tag, props, reactChildren);
}

function convertBrowser(html: string, options: Partial<HtmrOptions> = {}) {
  if (typeof html !== 'string') {
    throw new TypeError('Expected HTML string');
  }

  const opts: HtmrOptions = {
    transform: options.transform || {},
    preserveAttributes: options.preserveAttributes || [],
    dangerouslySetChildren: options.dangerouslySetChildren || ['style'],
  };
  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const childNodes = [];
  for (let i = 0; i < container.childNodes.length; i++) {
    childNodes.push(container.childNodes[i]);
  }

  const result = childNodes
    .map((childNode, index) => {
      return transform(childNode, String(index), opts);
    })
    .filter(result => result !== null);

  if (result.length === 1) {
    return result[0];
  }

  return result;
}

export default convertBrowser;
