/* eslint-env browser */
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import React, { ReactNode } from 'react';
import mapAttribute, { RawAttributes } from './mapAttribute';
import getPropName from './getPropName.browser';
import { HtmrOptions, HTMLTags } from './types';

export default function htmrBrowser(
  html: string,
  options: Partial<HtmrOptions> = {}
) {
  if (typeof html !== 'string') {
    throw new TypeError('Expected HTML string');
  }

  const container = document.createElement('div');
  container.innerHTML = html.trim();

  const nodes = Array.from(container.childNodes)
    .map((childNode, index) => {
      return toReactNode(childNode as any, String(index), options);
    })
    .filter(result => result !== null);

  return nodes.length === 1 ? nodes[0] : nodes;
}

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
interface CommentNode {
  nodeType: 8
}

interface TextNode {
  nodeType: 3
  textContent: string
}

interface ElementNode {
  nodeType: 1
  tagName: string;
  attributes: Array<{ name: string, value: string }>
  childNodes: DOMNode[]
  innerHTML: string;
}

type DOMNode = CommentNode | TextNode | ElementNode

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function toReactNode(node: DOMNode, key: string, options: Partial<HtmrOptions>): ReactNode {
  const transform = options.transform || {};
  const preserveAttributes = options.preserveAttributes || [];
  const dangerouslySetChildren = options.dangerouslySetChildren || ["style"];
  const defaultTransform = transform._;

  if (node.nodeType === 8) {
    return null;
  } else if (node.nodeType === 3) {
    const text = node.textContent;
    return defaultTransform ? defaultTransform(text) : text;
  }

  const attrs: RawAttributes = {};
  const nodeAttributes = node.attributes;
  for (let i = 0; i < nodeAttributes.length; i++) {
    attrs[nodeAttributes[i].name] = nodeAttributes[i].value;
  }

  attrs.key = key.toString();

  const tag = node.tagName.toLowerCase() as HTMLTags;
  const props = mapAttribute(tag, attrs, preserveAttributes, getPropName);

  const children = Array.from(node.childNodes).map((childNode, i) => {
    if (
      TABLE_ELEMENTS.indexOf(tag) > -1 &&
      childNode.nodeType === 3
    ) {
      childNode.textContent = childNode.textContent.trim();
      if (childNode.textContent === '') {
        return null;
      }
    }

    return toReactNode(childNode, key + '.' + i, options);
  }).filter(Boolean);

  if (dangerouslySetChildren.indexOf(tag) > -1) {
    let html = node.innerHTML;

    // Tag can have empty children
    if (html) {
      // we need to preserve quote inside style declaration
      if (tag !== 'style') {
        html = html.replace(/"/g, '&quot;');
      }
      props.dangerouslySetInnerHTML = { __html: html.trim() };
    }

    return reactCreateElement(tag, props, transform)
  }

  // self closing tag shouldn't have children
  const reactChildren = children.length === 0
    ? null
    : children;

  return reactCreateElement(tag, props, transform, reactChildren);
}

function reactCreateElement(tag: HTMLTags, props: ReturnType<typeof mapAttribute>, transform: HtmrOptions['transform'], children: any = null) {
  const customElement = transform[tag];
  const defaultTransform = transform._;

  return customElement
    ? React.createElement(customElement as any, props, children)
    : defaultTransform
      ? defaultTransform(tag, props, children)
      : React.createElement(tag, props, children)
}
