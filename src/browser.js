/* eslint-env browser */
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import React from 'react';
import mapAttribute from './mapAttribute';
import type { HtmrOptions, ConvertedComponent } from './types';

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
const NodeTypes = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8,
};

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

const tempEl = document.createElement('div');
function unescape(str) {
  // Here we use innerHTML to unescape html entities.
  // This is okay because we use the returned value as react children
  // not dangerouslySetInnerHTML
  tempEl.innerHTML = str;
  return tempEl.textContent;
}

function transform(node, key: number, options: HtmrOptions) {
  const defaultTransform = options.transform._;

  if (node.nodeType === NodeTypes.COMMENT) {
    return null;
  } else if (node.nodeType === NodeTypes.TEXT) {
    const text = unescape(node.textContent);
    return defaultTransform ? defaultTransform(text) : text;
  }

  // element
  const tag = node.tagName.toLowerCase();
  const customElement = options.transform[tag];

  const attrs = {};
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

  // style tag needs to preserve its children
  if (tag === 'style' && !customElement && !defaultTransform) {
    props.dangerouslySetInnerHTML = { __html: children[0] };
    return React.createElement(tag, props, null);
  }

  // self closing tag shouldn't have children
  if (children.length === 0) {
    children = null;
  }

  if (customElement) {
    return React.createElement(customElement, props, children);
  }

  if (defaultTransform) {
    return defaultTransform(tag, props, children);
  }

  return React.createElement(tag, props, children);
}

function convertBrowser(
  html: string,
  options: HtmrOptions = {}
): ConvertedComponent {
  const opts = {
    transform: options.transform || {},
    preserveAttributes: options.preserveAttributes || [],
  };
  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const childNodes = [];
  for (let i = 0; i < container.childNodes.length; i++) {
    childNodes.push(container.childNodes[i]);
  }

  const result = childNodes
    .map((childNode, index) => {
      return transform(childNode, index, opts);
    })
    .filter(result => result !== null);

  if (result.length === 1) {
    return result[0];
  }

  return result;
}

export default convertBrowser;
