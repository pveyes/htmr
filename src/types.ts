import {
  JSX,
  ReactNode,
  ComponentType,
  ComponentProps,
  AllHTMLAttributes,
} from 'react';

// ReactHTML & ReactSVG are removed in @types/react 19, intrinsic elements work everywhere
type AllTags = Extract<keyof JSX.IntrinsicElements, string>;
export type HTMLTags = AllTags;
export type SVGTags = AllTags;

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
