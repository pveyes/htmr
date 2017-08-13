// @flow
import React from 'react';
import parse from 'posthtml-parser';
import mapAttribute from './mapAttribute';

type Node = {
  tag: string,
  attrs: {
    [key: string]: string,
  },
  content: Array<string | Node>,
};

type NodeMap = {
  [key: string]: React$Element,
};

function transform(node: Node, key: number, nodeMap: NodeMap): $ReactElement {
  if (typeof node === 'string' && node.trim() === '') {
    // newline and space will be parsed as 'node' in posthtml-parser,
    // we can ignore it
    return null;
  }

  // string literal for children should not be processed
  if (typeof node === 'string') {
    return node;
  }

  const { tag, attrs, content } = node;

  const props = Object.assign(
    mapAttribute(attrs),
    // always set key because it's possible the html source contains
    // multiple elements
    { key }
  );

  // self closing component doesn't have children
  const children =
    content === undefined
      ? null
      : content.map((child, index) => {
          const childKey = `${key}.${index}`;
          return transform(child, childKey, nodeMap);
        });

  const Component = nodeMap[tag] || tag;
  return React.createElement(Component, props, children);
}

function toReactElement(html: string, nodeMap: NodeMap = {}) {
  const ast = parse(html);
  const components = ast
    .map((node, index) => transform(node, index, nodeMap))
    .filter(node => node !== null);

  if (components.length > 1) {
    return components;
  }

  return components[0];
}

module.exports = toReactElement;
