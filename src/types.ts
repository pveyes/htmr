import { ReactElement } from "react";

export type NodeMap = {
  [key: string]: any,
};

export type HtmrOptions = {
  transform: NodeMap,
  preserveAttributes: Array<String | RegExp>,
};

type Component = ReactElement<any>;

export type ChildComponent = Component | string | null;
