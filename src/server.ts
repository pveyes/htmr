// @flow
import parse from 'posthtml-parser';
import React, { ReactNode } from 'react';
import { AllHtmlEntities as HtmlEntity } from 'html-entities';
import mapAttribute from './mapAttribute';

import { HtmrOptions, HTMLTags } from './types';

// eslint-disable-next-line no-use-before-define
type Node = ElementNode | TextNode;

type TextNode = string;

type ElementNode = {
  tag: HTMLTags,
  attrs: {
    [key: string]: string,
  },
  content: Array<Node>,
};

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function transform(node: Node, key: string, options: HtmrOptions): ReactNode {
  const defaultTransform = options.transform._;

  if (typeof node === 'string') {
    // newline and space will be parsed as 'node' in posthtml-parser,
    // we can ignore it along with comment node
    const text = node.trim();
    if (/^<!--[\s\S]+-->/.test(text)) {
      return null;
    }

    const str = HtmlEntity.decode(node);
    return defaultTransform ? defaultTransform(str) : str;
  }

  const { tag, attrs, content } = node;
  const customElement = options.transform[tag];

  // decode all attribute value
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      attrs[key] = HtmlEntity.decode(attrs[key]);
    });
  }

  const props = Object.assign(
    {},
    mapAttribute(attrs, options.preserveAttributes),
    // always set key because it's possible the html source contains
    // multiple elements
    { key }
  );

  // if the tags children should be set dangerously
  if (options.dangerouslySetChildren.indexOf(tag) > -1) {
    const innerHTML = <TextNode>content[0];
    props.dangerouslySetInnerHTML = {
      __html: innerHTML.trim()
    };
    return React.createElement(tag, props, null);
  }

  // self closing component doesn't have children
  let children =
    content === undefined
      ? null
      : content
        .map((child, index) => {
          if (TABLE_ELEMENTS.indexOf(tag) > -1 && typeof child == 'string') {
            child = child.trim();
            if (child === '') {
              return null;
            }
          }

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

  if (defaultTransform) {
    return defaultTransform(tag, props, children);
  }

  return React.createElement(tag, props, children);
}

export default function convertServer(html: string, options: Partial<HtmrOptions> = {}) {
  if (typeof html !== 'string') {
    throw new TypeError('Expected HTML string');
  }

  const opts: HtmrOptions = {
    transform: options.transform || {},
    preserveAttributes: options.preserveAttributes || [],
    dangerouslySetChildren: options.dangerouslySetChildren || ["style"],
  };
  const ast: Array<Node> = parse(html.trim());

  const components = ast
    .map((node, index) => transform(node, index.toString(), opts))
    .filter(node => node !== null);

  if (components.length > 1) {
    return components;
  }

  return components[0];
}
