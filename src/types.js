// @flow
export type NodeMap = {
  [key: string]: *,
};

export type HtmrOptions = {
  transform: NodeMap,
  preserveAttributes: Array<String | RegExp>,
};

type Component = React$Element<*>;

export type ConvertedComponent = Component | Array<Component>;
