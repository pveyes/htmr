// @flow
import parse from 'posthtml-parser';
import React from 'react';
import { AllHtmlEntities as HtmlEntity } from 'html-entities';
import mapAttribute from './mapAttribute';

import type { NodeMap, ConvertedComponent } from './types';

// eslint-disable-next-line no-use-before-define
type Node = ElementNode | TextNode;

type TextNode = string;

type ElementNode = {
  tag: string,
  attrs: {
    [key: string]: string,
  },
  content: Array<Node>,
};

type Element = React$Element<*> | string;

function transform(node: Node, key: string, nodeMap: NodeMap): ?Element {
  if (typeof node === 'string') {
    // newline and space will be parsed as 'node' in posthtml-parser,
    // we can ignore it along with comment node
    const text = node.trim();
    if (text === '' || /^<!--[\s\S]+-->/.test(text)) {
      return null;
    }
  }

  if (typeof node === 'string') {
    return HtmlEntity.decode(node);
  }

  const { tag, attrs, content } = node;

  const props = Object.assign(
    {},
    mapAttribute(attrs),
    // always set key because it's possible the html source contains
    // multiple elements
    { key }
  );

  // self closing component doesn't have children
  let children =
    content === undefined
      ? null
      : content
          .map((child, index) => {
            const childKey = `${key}.${index}`;
            return transform(child, childKey, nodeMap);
          })
          .filter(child => child !== null);

  if (children && children.length === 0) {
    children = null;
  }

  const Component = nodeMap[tag] || tag;
  return React.createElement(Component, props, children);
}

function convertServer(
  html: string,
  nodeMap: NodeMap = {}
): ConvertedComponent {
  const ast = parse(html.trim());
  const components = ast
    .map((node, index) => transform(node, index.toString(), nodeMap))
    .filter(node => node !== null);

  if (components.length > 1) {
    return components;
  }

  return components[0];
}

module.exports = convertServer;
