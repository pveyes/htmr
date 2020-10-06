import React, { ReactHTML, ReactSVG, ReactNode, ComponentType } from "react";

export type HTMLTags = keyof ReactHTML;
export type SVGTags = keyof ReactSVG;

type HTMLTransform = {
  [tag in HTMLTags | SVGTags]: HTMLTags | SVGTags | ComponentType<React.ComponentProps<tag>>;
};

type DefaultTransform = {
  _: <P>(element: string | HTMLTags | SVGTags, props?: P, children?: ReactNode) => ReactNode
}

export type HtmrOptions = {
  transform: Partial<HTMLTransform & DefaultTransform>,
  preserveAttributes: Array<String | RegExp>,
  /** An array of tags whos children should be set as raw html */
  dangerouslySetChildren: HTMLTags[]
};
