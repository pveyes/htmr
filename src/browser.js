/* eslint-env browser */
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import React from 'react';
import mapAttribute from './mapAttribute';
import type { NodeMap, ConvertedComponent } from './types';

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
const NodeTypes = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8,
};

const tempEl = document.createElement('div');
function unescape(str) {
  // Here we use innerHTML to unescape html entities.
  // This is okay because we use the returned value as react children
  // not dangerouslySetInnerHTML
  tempEl.innerHTML = str;
  return tempEl.textContent;
}

function transform(node, nodeMap: NodeMap, key: ?number) {
  if (node.nodeType === NodeTypes.COMMENT) {
    return null;
  } else if (node.nodeType === NodeTypes.TEXT) {
    return node.textContent.trim() === ''
      ? node.textContent
      : unescape(node.textContent);
  }

  // element
  const tag = node.tagName.toLowerCase();
  const Component = nodeMap[tag] || tag;

  const attrs = {};
  for (let i = 0; i < node.attributes.length; i++) {
    const key = node.attributes[i].name;
    const value = node.attributes[i].value;
    attrs[key] = value;
  }

  attrs.key = key;
  const props = mapAttribute(attrs);

  let children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const childKey = key === null ? i : `${key}.${i}`;
    const component = transform(node.childNodes[i], nodeMap, childKey);
    if (component !== null) {
      children.push(component);
    }
  }

  // style tag needs to preserve its children
  if (tag === 'style' && Component === tag) {
    props.dangerouslySetInnerHTML = { __html: children[0] };
    return React.createElement(tag, props, null);
  }

  // self closing tag shouldn't have children
  if (children.length === 0) {
    children = null;
  }

  return React.createElement(Component, props, children);
}

function convertBrowser(
  html: string,
  nodeMap: NodeMap = {}
): ConvertedComponent {
  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const childNodes = [];
  for (let i = 0; i < container.childNodes.length; i++) {
    childNodes.push(container.childNodes[i]);
  }

  const result = childNodes
    .map((childNode, index) => {
      return transform(childNode, nodeMap, index);
    })
    .filter(result => result !== null);

  if (result.length === 1) {
    return result[0];
  }

  return result;
}

export default convertBrowser;
