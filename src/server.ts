import React, { ReactNode } from 'react';
import { parseDocument } from 'htmlparser2';
import { Node } from 'domhandler';
import { AllHtmlEntities as HtmlEntity } from 'html-entities';
import mapAttribute from './mapAttribute';

import { HtmrOptions, HTMLTags } from './types';

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

function transform(
  childNode: Node,
  key: string,
  options: HtmrOptions
): ReactNode {
  const defaultTransform = options.transform._;
  switch (childNode.type) {
    case 'script':
    case 'style':
    case 'tag': {
      const node: HTMLNode = childNode as any;
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

      const customElement = options.transform[name];

      // if the tags children should be set dangerously
      if (options.dangerouslySetChildren.indexOf(name) > -1) {
        // Tag can have empty children
        if (node.children.length > 0) {
          const childNode: TextNode = node.children[0] as any;
          const html =
            name === 'style' || name === 'script'
              ? // preserve encoding on style tag
                childNode.data.trim()
              : HtmlEntity.encode(childNode.data.trim());
          props.dangerouslySetInnerHTML = { __html: html };
        }

        return customElement
          ? React.createElement(customElement as any, props, null)
          : defaultTransform
          ? defaultTransform(name, props, null)
          : React.createElement(name, props, null);
      }

      const childNodes = node.children
        .map((node, index) => transform(node, index.toString(), options))
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

      str = HtmlEntity.decode(str);
      return defaultTransform ? defaultTransform(str) : str;
    }
  }
}

export default function convertServer(
  html: string,
  options: Partial<HtmrOptions> = {}
) {
  if (typeof html !== 'string') {
    throw new TypeError('Expected HTML string');
  }

  const opts: HtmrOptions = {
    transform: options.transform || {},
    preserveAttributes: options.preserveAttributes || [],
    dangerouslySetChildren: options.dangerouslySetChildren || ['style'],
  };

  const doc = parseDocument(html.trim(), {});
  const components = doc.childNodes.map((node, index) =>
    transform(node, index.toString(), opts)
  );

  if (components.length > 1) {
    return components;
  }

  return components[0];
}
