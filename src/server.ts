import React, { ReactNode } from 'react';
import { HtmrOptions, HTMLTags } from "./types";
import Parser from 'htmlparser2';
import { AllHtmlEntities as HtmlEntity } from 'html-entities';
import mapAttribute from './mapAttribute';

type HTMLNode = {
  type: 'tag' | 'style',
  name: HTMLTags,
  attribs: {
    [key: string]: any
  }
  children: Array<Node>
}

type TextNode = {
  type: 'text',
  data: string,
  parent?: HTMLNode
}

type Node = HTMLNode | TextNode;

const TABLE_ELEMENTS = ['table', 'tbody', 'thead', 'tfoot', 'tr'];

function transform(node: Node, key: string, options: HtmrOptions): ReactNode {
  const defaultTransform = options.transform._;

  switch (node.type) {
    case 'style':
    case 'tag': {
      const { name, attribs } = node;

      // decode all attribute value
      Object.keys(attribs).forEach(key => {
        attribs[key] = HtmlEntity.decode(attribs[key]);
      });

      const props = Object.assign(
        {},
        mapAttribute(attribs, options.preserveAttributes),
        { key }
      );

      // if the tags children should be set dangerously
      if (options.dangerouslySetChildren.indexOf(name) > -1) {
        const childNode = <TextNode>node.children[0];
        props.dangerouslySetInnerHTML = {
          __html: childNode.data.trim()
        };
        return React.createElement(name, props, null);
      }

      const childNodes = node.children
        .map((node, index) => transform(node, index.toString(), options))
        .filter(Boolean);

      // self closing component doesn't have children
      const children = childNodes.length === 0
        ? null
        : childNodes;

      const customElement = options.transform[name];
      if (customElement) {
        return React.createElement(customElement, props, children);
      }

      if (defaultTransform) {
        return defaultTransform(name, props, children);
      }

      return React.createElement(name, props, children);
    }
    case 'text': {
      let str = node.data;

      if (node.parent && TABLE_ELEMENTS.indexOf(node.parent.name) > -1) {
        str = str.trim();
        if (str === '') {
          return null;
        }
      }

      str = HtmlEntity.decode(str);

      return defaultTransform ? defaultTransform(str) : str;
    }
  }
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

  const ast = Parser.parseDOM(html.trim(), {}) as Array<HTMLNode>;
  const components = ast.map((node, index) => transform(node, index.toString(), opts));

  if (components.length > 1) {
    return components;
  }

  return components[0];
}
