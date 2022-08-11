# htmr [![Actions Status](https://github.com/pveyes/htmr/workflows/test/badge.svg)](https://github.com/pveyes/htmr/actions) [![bundle size](http://img.badgesize.io/https://unpkg.com/htmr/lib/htmr.browser.js?compression=gzip)](https://unpkg.com/htmr/lib/htmr.browser.js)

> Simple and lightweight (< 2kB) HTML string to react element conversion library

## Install

```sh
$ yarn add htmr

# or

$ npm install htmr --save
```

## Usage

Use the default export, and pass HTML string.

```js
import React from 'react';
import htmr from 'htmr';

function HTMLComponent() {
  return htmr('<p>No more dangerouslySetInnerHTML</p>');
}
```

The API also accepts second argument `options` containing few optional fields. Below are their default values:

```js
const options = {
  transform: {},
  preserveAttributes: [],
  dangerouslySetChildren: ['style'],
};
htmr(html, options);
```

### transform

transform accepts key value pairs, that will be used to transforms node (key) to custom component (value). You can use it to render specific tag name with custom component. For example: component with
predefined styles like
[styled-components](https://github.com/styled-components/styled-components).

```js
import React from 'react';
import htmr from 'htmr';
import styled from 'styled-components';

const Paragraph = styled.p`
  font-family: Helvetica, Arial, sans-serif;
  line-height: 1.5;
`;

const transform = {
  p: Paragraph,
  // you can also pass string for native DOM node
  a: 'span',
};

function TransformedHTMLComponent() {
  // will return <Paragraph><span>{'Custom component'}</span></Paragraph>
  return htmr('<p><a>Custom component</a></p>', { transform });
}
```

You can also provide default transform using underscore `_` as property name.

This can be useful if you want to do string preprocessing (like removing all whitespace), or rendering HTML as native view in [react-native](https://github.com/facebook/react-native):

```js
import React from 'react';
import { Text, View } from 'react-native';

const transform = {
  div: View,
  _: (node, props, children) => {
    // react-native can't render string without <Text> component
    // we can test text node by checking component props, text node won't have them
    if (typeof props === 'undefined') {
      // use `key` because it's possible that <Text> is rendered
      // inside array as sibling
      return <Text key={node}>{node}</Text>;
    }

    // render unknown tag using <View>
    // ideally you also filter valid props to <View />
    return <View {...props}>{children}</View>;
  },
};

function NativeHTMLRenderer(props) {
  return htmr(props.html, { transform });
}
```

### preserveAttributes

By default `htmr` will convert HTML attributes to camelCase because that's what React uses. You can override this behavior by passing `preserveAttributes` options. Specify array of string / regular expression to test which attributes you want to preserve.

For example you want to make sure `ng-if`, `v-if` and `v-for` to be rendered as is

```js
htmr(html, { preserveAttributes: ['ng-if', new RegExp('v-')] });
```

### dangerouslySetChildren

By default `htmr` will only render children of `style` tag inside `dangerouslySetInnerHTML` due to security reason. You can override this behavior by passing array of HTML tags if you want the children of the tag to be rendered dangerously.

```js
htmr(html, { dangerouslySetChildren: ['code', 'style'] });
```

**Note** that if you still want `style` tag to be rendered using `dangerouslySetInnerHTML`, you still need to include it in the array.

## Multiple children

You can also convert HTML string which contains multiple elements. This returns
an array, so make sure to wrap the output inside other component such as div, or
use React 16.

```js
import React from 'react';
import htmr from 'htmr';

const html = `
  <h1>This string</h1>
  <p>Contains multiple html tags</p>
  <p>as sibling</p>
`;

function ComponentWithSibling() {
  // if using react 16, simply use the return value because
  // v16 can render array
  return htmr(html);
  // if using react 15 and below, wrap in another component
  return <div>{htmr(html)}</div>;
}
```

## Typescript, htmr transform and Web Components

If you're using `htmr` to transform custom elements in a typescript code, you'll get type error because custom element is not defined as valid property. To work around this, you can define the mapping in a separate object, and typecast as `any` while spreading in transform object:

```ts
import { ElementType } from 'react';
import { HtmrOptions } from 'htmr';

const customElementTransform: Record<string, ElementType> = {
  'virtual-scroller': VirtualScroller,
};

const options: HtmrOptions = {
  transform: {
    a: Anchor,
    ...(customElementTransform as any),
  },
};

htmr(html, options);
```

## Use Cases

This library was initially built to provides easy component mapping between HTML
string and React component. It's mainly used to render custom
component from HTML string returned from an API. This library **prioritize
file size and simple API** over full HTML conversion coverage and other features
like JSX parsing or flexible node traversal.

That's why I've decided to not implement some features (see **Trade Off**
section below). If you feel like you need more features that's not possible
using this library, you can check out some related projects below.

## Trade Off

- Inline event attributes (`onclick=""` etc) are not supported due to unnecessary complexity
- htmr use native browser HTML parser when run in browser instead of using custom parser. Due to how browser HTML parser works, you can get weird result if you supply "invalid" html, for example `div` inside `p` element like `<p><div>text</div></p>`
- Script tag is not rendered using `dangerouslySetInnerHTML` by default due to security. You can opt in by using [`dangerouslySetChildren`](#dangerouslysetchildren)
- Style tag renders it children using `dangerouslySetInnerHTML` by default. You can also reverse this behavior using same method.

## Related projects

HTML to react element:

- [html-to-react](https://github.com/aknuds1/html-to-react)
- [react-html-parser](https://github.com/wrakky/react-html-parser)
- [html-react-parser](https://github.com/remarkablemark/html-react-parser)
- [react-render-html](https://github.com/noraesae/react-render-html)

HTML (page) to react component (file/string):

- [html-to-react-components](https://github.com/roman01la/html-to-react-components)
- [react-magic](https://github.com/reactjs/react-magic)

## License

MIT
