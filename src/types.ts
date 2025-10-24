import {
  ReactNode,
  ComponentType,
  ComponentProps,
  AllHTMLAttributes,
  JSX,
} from 'react';

export type HTMLTags = keyof JSX.IntrinsicElements;
export type SVGTags = keyof JSX.IntrinsicElements;
type AllTags = keyof JSX.IntrinsicElements;

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
