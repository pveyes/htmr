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
function escape(str) {
  tempEl.textContent = str;
  return tempEl.innerHTML;
}

function transform(node, nodeMap: NodeMap, key: ?number) {
  if (node.nodeType === NodeTypes.COMMENT) {
    return null;
  } else if (node.nodeType === NodeTypes.TEXT) {
    return node.textContent.trim() === '' ? null : escape(node.textContent);
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

  const props = Object.assign(mapAttribute(attrs), { key });

  const children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const childKey = key === null ? i : `${key}.${i}`;
    children.push(transform(node.childNodes[i], nodeMap, childKey));
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
    const node = container.childNodes[i];
    if (
      node.nodeType === NodeTypes.ELEMENT ||
      (node.nodeType === NodeTypes.TEXT && node.textContent.trim() !== '')
    ) {
      childNodes.push(node);
    }
  }

  let result;

  if (childNodes.length === 1) {
    result = transform(childNodes[0], nodeMap, null);
  } else {
    result = childNodes.map((childNode, index) => {
      return transform(childNode, nodeMap, index);
    });
  }

  if (result.length === 1) {
    return result[0];
  }

  return result;
}

module.exports = convertBrowser;
