import React, { ReactHTML, ReactSVG, ReactNode, ComponentType } from "react";

export type HTMLTags = keyof ReactHTML;
export type SVGTags = keyof ReactSVG;
type AllTags = HTMLTags | SVGTags

type HTMLTransform = {
  [tag in AllTags]: AllTags | ComponentType<Omit<React.ComponentProps<tag>, 'ref'>>;
};

type DefaultTransform = {
  _: <Props>(element: string | AllTags, props?: Props, children?: ReactNode) => ReactNode
}

export type HtmrOptions = {
  transform: Partial<HTMLTransform & DefaultTransform>,
  preserveAttributes: Array<String | RegExp>,
  /** An array of tags in which their children should be set as raw html */
  dangerouslySetChildren: HTMLTags[]
};
