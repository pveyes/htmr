import {
  type ReactHTML,
  type ReactSVG,
  type ReactNode,
  type ComponentType,
  type ComponentProps,
  type AllHTMLAttributes,
} from 'react';

export type HTMLTags = keyof ReactHTML;
export type SVGTags = keyof ReactSVG;
type AllTags = HTMLTags | SVGTags;

type HTMLTransform = {
  [tag in AllTags]: AllTags | ComponentType<Omit<ComponentProps<tag>, 'ref'>>;
};

type DefaultTransform = {
  _: <Props extends AllHTMLAttributes<any>>(
    element: string | AllTags,
    props?: Props,
    children?: ReactNode
  ) => ReactNode;
};

type CustomElementTransform = {
  [key in `${string}-${string}`]: AllTags | ComponentType<unknown>;
};

export type HtmrOptions = {
  transform: Partial<HTMLTransform & DefaultTransform & CustomElementTransform>;
  preserveAttributes: Array<String | RegExp>;
  /** An array of tags in which their children should be set as raw html */
  dangerouslySetChildren: HTMLTags[];
};
