// @flow
export type NodeMap = {
  [key: string]: *,
};

export type HtmrOptions = {
  map?: NodeMap,
};

type Component = React$Element<*>;

export type ConvertedComponent = Component | Array<Component>;
