// @flow
import parse from 'posthtml-parser';
import React from 'react';
import { AllHtmlEntities as HtmlEntity } from 'html-entities';
import mapAttribute from './mapAttribute';

import type { HtmrOptions, ConvertedComponent } from './types';

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

function transform(node: Node, key: string, options: HtmrOptions): ?Element {
  const defaultMap = options.map._;

  if (typeof node === 'string') {
    // newline and space will be parsed as 'node' in posthtml-parser,
    // we can ignore it along with comment node
    const text = node.trim();
    if (/^<!--[\s\S]+-->/.test(text)) {
      return null;
    }

    const str = HtmlEntity.decode(node);
    return defaultMap ? defaultMap(str) : str;
  }

  const { tag, attrs, content } = node;
  const customElement = options.map[tag];

  // decode all attribute value
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      attrs[key] = HtmlEntity.decode(attrs[key]);
    });
  }

  const props = Object.assign(
    {},
    mapAttribute(attrs),
    // always set key because it's possible the html source contains
    // multiple elements
    { key }
  );

  // style tag needs to preserve its children
  if (tag === 'style' && !customElement && !defaultMap) {
    props.dangerouslySetInnerHTML = { __html: content[0] };
    return React.createElement(tag, props, null);
  }

  // self closing component doesn't have children
  let children =
    content === undefined
      ? null
      : content
          .map((child, index) => {
            const childKey = `${key}.${index}`;
            return transform(child, childKey, options);
          })
          .filter(child => child !== null);

  if (children && children.length === 0) {
    children = null;
  }

  if (customElement) {
    return React.createElement(customElement, props, children);
  }

  if (defaultMap) {
    return defaultMap(tag, props, children);
  }

  return React.createElement(tag, props, children);
}

function convertServer(html: string, options: Object = {}): ConvertedComponent {
  const opts = { map: options.map || {} };
  const ast = parse(html.trim());
  const components = ast
    .map((node, index) => transform(node, index.toString(), opts))
    .filter(node => node !== null);

  if (components.length > 1) {
    return components;
  }

  return components[0];
}

module.exports = convertServer;
