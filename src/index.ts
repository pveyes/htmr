import React, { ReactNode } from 'react';
import { parseDocument } from 'htmlparser2';
import { Node } from 'domhandler';
import { encode, decode } from 'html-entities';
import mapAttribute from './mapAttribute';
import { HtmrOptions, HTMLTags } from './types';

export default function htmrServer(
  html: string,
  options: Partial<HtmrOptions> = {}
) {
  if (typeof html !== 'string') {
    throw new TypeError('Expected HTML string');
  }

  const doc = parseDocument(html.trim(), {});
  const nodes = doc.childNodes.map((node, index) =>
    toReactNode(node, index.toString(), options)
  );
  return nodes.length === 1 ? nodes[0] : nodes;
}

type HTMLNode = {
  type: 'tag' | 'style' | 'script';
  name: HTMLTags;
  attribs: {
    [key: string]: any;
  };
  children: Array<Node>;
};

type TextNode = {
  type: 'text';
  data: string;
  parent?: HTMLNode;
};

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function toReactNode(
  childNode: Node,
  key: string,
  options: Partial<HtmrOptions>
): ReactNode {
  const transform = options.transform || {};
  const preserveAttributes = options.preserveAttributes || [];
  const dangerouslySetChildren = options.dangerouslySetChildren || ['style'];
  const defaultTransform = transform._;
  switch (childNode.type) {
    case 'script':
    case 'style':
    case 'tag': {
      const node: HTMLNode = childNode as any;
      const { name, attribs } = node;

      // decode all attribute value
      Object.keys(attribs).forEach((key) => {
        attribs[key] = decode(attribs[key]);
      });

      const props = Object.assign(
        {},
        mapAttribute(name, attribs, preserveAttributes, getPropName),
        { key }
      );

      const customElement = transform[name];

      // if the tags children should be set dangerously
      if (dangerouslySetChildren.indexOf(name) > -1) {
        // Tag can have empty children
        if (node.children.length > 0) {
          const childNode: TextNode = node.children[0] as any;
          const html =
            name === 'style' || name === 'script'
              ? // preserve encoding on style & script tag
                childNode.data.trim()
              : encode(childNode.data.trim());
          props.dangerouslySetInnerHTML = { __html: html };
        }

        return customElement
          ? React.createElement(customElement as any, props, null)
          : defaultTransform
          ? defaultTransform(name, props, null)
          : React.createElement(name, props, null);
      }

      const childNodes = node.children
        .map((node, index) => toReactNode(node, index.toString(), options))
        .filter(Boolean);

      // self closing component doesn't have children
      const children = childNodes.length === 0 ? null : childNodes;

      if (customElement) {
        return React.createElement(customElement as any, props, children);
      }

      if (defaultTransform) {
        return defaultTransform(name, props, children);
      }

      return React.createElement(name, props, children);
    }
    case 'text': {
      const node: TextNode = childNode as any;
      let str = node.data;

      if (node.parent && TABLE_ELEMENTS.indexOf(node.parent.name) > -1) {
        str = str.trim();
        if (str === '') {
          return null;
        }
      }

      str = decode(str);
      return defaultTransform ? defaultTransform(str) : str;
    }
  }
}

import attributes from './attribute.json';

type AttributeMap = Record<string, string>;
const attrs = <AttributeMap>attributes;

function getPropName(_originalTag: HTMLTags, attributeName: string) {
  return attrs[attributeName] || attributeName;
}
