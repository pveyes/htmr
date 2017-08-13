/* eslint-env browser */
// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
import React from 'react';
import mapAttribute from './mapAttribute';
import type { NodeMap } from './types';

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
  switch (node.nodeType) {
    case NodeTypes.COMMENT:
      return null;
    case NodeTypes.TEXT: {
      if (node.textContent.trim() === '') {
        return null;
      }
      return escape(node.textContent);
    }
    default:
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

  const children = Array.from(node.childNodes).map((childNode, index) => {
    const childKey = key === null ? index : `${key}.${index}`;

    return transform(childNode, nodeMap, childKey);
  });

  return React.createElement(Component, props, children);
}

function convertBrowser(html: string, nodeMap: NodeMap = {}) {
  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const childNodes = Array.from(container.childNodes).filter(node => {
    return (
      node.nodeType === NodeTypes.ELEMENT ||
      (node.nodeType === NodeTypes.TEXT && node.textContent.trim() !== '')
    );
  });

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
