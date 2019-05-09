import { ReactElement, ReactHTML, ReactNode, ComponentType } from "react";

export type HTMLTags = keyof ReactHTML;

type HTMLTransform = {
  [tag in HTMLTags]: HTMLTags | ComponentType;
};

type DefaultTransform = {
  _: <T>(element: string | HTMLTags, props: T, children: ReactNode) => ReactElement<T>
}

export type HtmrOptions = {
  transform: Partial<HTMLTransform & DefaultTransform>,
  preserveAttributes: Array<String | RegExp>,
};

type Component = ReactElement<any>;

export type ChildComponent = Component | string | null;
