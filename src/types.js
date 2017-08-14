// @flow
export type NodeMap = {
  [key: string]: *,
};

type Component = React$Element<*>;

export type ConvertedComponent = Component | Array<Component>;
