/* eslint-env browser */
// Based on https://github.com/reactjs/react-magic/blob/master/src/htmltojsx.js
import React, { ReactNode } from 'react';
import mapAttribute, { RawAttributes } from './mapAttribute';
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
    .filter(Boolean);

  return nodes.length === 1 ? nodes[0] : nodes;
}

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
interface CommentNode {
  nodeType: 8;
}

interface TextNode {
  nodeType: 3;
  textContent: string;
}

interface ElementNode {
  nodeType: 1;
  tagName: string;
  attributes: Array<{ name: string; value: string }>;
  childNodes: DOMNode[];
  innerHTML: string;
}

type DOMNode = CommentNode | TextNode | ElementNode;

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function toReactNode(
  node: DOMNode,
  key: string,
  options: Partial<HtmrOptions>
): ReactNode {
  const transform = options.transform || {};
  const preserveAttributes = options.preserveAttributes || [];
  const dangerouslySetChildren = options.dangerouslySetChildren || ['style'];
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
  const props = mapAttribute(tag, attrs, preserveAttributes, getPropInfo);

  const children = Array.from(node.childNodes)
    .map((childNode, i) => {
      if (TABLE_ELEMENTS.indexOf(tag) > -1 && childNode.nodeType === 3) {
        childNode.textContent = childNode.textContent.trim();
        if (childNode.textContent === '') {
          return null;
        }
      }

      return toReactNode(childNode, key + '.' + i, options);
    })
    .filter(Boolean);

  if (dangerouslySetChildren.indexOf(tag) > -1) {
    let html = node.innerHTML;

    // Tag can have empty children
    if (html) {
      // we need to preserve quote inside style & script tag
      if (tag !== 'style' && tag !== 'script') {
        html = html.replace(/"/g, '&quot;');
      }
      props.dangerouslySetInnerHTML = { __html: html.trim() };
    }

    return reactCreateElement(tag, props, transform);
  }

  // self closing tag shouldn't have children
  const reactChildren = children.length === 0 ? null : children;

  return reactCreateElement(tag, props, transform, reactChildren);
}

// map HTML attribute to react props, and optionally DOM prop by using array
// if DOM prop is same as attribute name, use single item array
const attributePropMap: Record<string, string | string[]> = {
  for: 'htmlFor',
  class: 'className',
  // react prop and DOM prop have different casing
  allowfullscreen: ['allowFullScreen', 'allowFullscreen'],
  autocomplete: 'autoComplete',
  autofocus: ['autoFocus'],
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srcset: 'srcSet',
  itemscope: 'itemScope',
  itemprop: 'itemProp',
  itemtype: 'itemType',
};

/**
 * In browser we can get equivalent React props by creating a temporary DOM node,
 * and iterating over its properties. This means we don't have to ship entire
 * HTML attributes mapping to React props.
 *
 * For other edge cases we can use specialPropsMaps
 */
function getPropInfo(tagName: HTMLTags, attributeName: string) {
  const propName = attributePropMap[attributeName];
  const el = document.createElement(tagName);

  // handle edge cases first
  if (propName) {
    const reactProp = Array.isArray(propName) ? propName[0] : propName;
    const domProp = Array.isArray(propName)
      ? propName[1] || attributeName
      : propName;
    return { name: reactProp, isBoolean: checkBooleanAttribute(el, domProp) };
  }

  for (let propName in el) {
    if (propName.toLowerCase() === attributeName.toLowerCase()) {
      return { name: propName, isBoolean: checkBooleanAttribute(el, propName) };
    }
  }

  return {
    name: attributeName,
    isBoolean: checkBooleanAttribute(el, attributeName),
  };
}

function checkBooleanAttribute(el: HTMLElement, prop: any) {
  el.setAttribute(prop, '');
  // @ts-ignore
  return el[prop] === true || SPECIAL_BOOLEAN_ATTRIBUTES.indexOf(prop) > -1;
}

// some attribute can't be checked whether it's a boolean attribute
// or not by using setAttribute trick
const SPECIAL_BOOLEAN_ATTRIBUTES: string[] = ['itemScope'];

function reactCreateElement(
  tag: HTMLTags,
  props: ReturnType<typeof mapAttribute>,
  transform: HtmrOptions['transform'],
  children: any = null
) {
  const customElement = transform[tag];
  const defaultTransform = transform._;

  return customElement
    ? React.createElement(customElement as any, props, children)
    : defaultTransform
    ? defaultTransform(tag, props, children)
    : React.createElement(tag, props, children);
}
