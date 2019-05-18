# htmr [![Build Status](https://travis-ci.org/pveyes/htmr.svg?branch=master)](https://travis-ci.org/pveyes/htmr) [![bundle size](http://img.badgesize.io/https://unpkg.com/htmr/lib/htmr.min.js?compression=gzip)](https://unpkg.com/htmr/lib/htmr.min.js) [![codecov](https://codecov.io/gh/pveyes/htmr/branch/master/graph/badge.svg)](https://codecov.io/gh/pveyes/htmr)

[![Greenkeeper badge](https://badges.greenkeeper.io/pveyes/htmr.svg)](https://greenkeeper.io/)

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
import convert from 'htmr';

class Component extends React.Component {
  render() {
    return convert('<p>No more dangerouslySetInnerHTML</p>');
  }
}
```

The API also accepts second argument `options` containing few optional fields. Below are their default values:

```js
const options = {
  transform: {},
  preserveAttributes: [],
  dangerouslySetChildren: ['style'],
};
convert(html, options);
```

### transform

transform accepts key value pairs, that will be used to transforms node (key) to custom component (value). You can use it to render specific tag name with custom component. For example: component with
predefined styles such as [emotion](https://github.com/tkh44/emotion) /
[styled-components](https://github.com/styled-components/styled-components).

```js
import React from 'react';
import convert from 'htmr';
import styled from 'emotion/react';

const Paragraph = styled('p')`
  font-family: Helvetica, Arial, sans-serif;
  line-height: 1.5;
`;

const transform = {
  p: Paragraph,
  // you can also pass string for native DOM node
  a: 'span',
};

class Component extends React.Component {
  render() {
    // will return <Paragraph><span>{'Custom component'}</span></Paragraph>
    return convert('<p><a>Custom component</a></p>', { transform });
  }
}
```

You can also provide default transform using underscore `_` syntax, similar to [pattern matching](https://reasonml.github.io/docs/en/pattern-matching.html) special fall-through case.

This can be useful if you want to do string preprocessing (like removing all whitespace), or rendering HTML as native view in [react-native](https://github.com/facebook/react-native):

```js
import React from 'react';
import { Text, View } from 'react-native';

let i = 0;

const transform = {
  // react-native uses View instead of div
  div: View,
  _: (node, props, children) => {
    // react-native can't render string without <Text> component
    // we can test text node by checking component props, text node won't have them
    if (typeof props === 'undefined') {
      // we use auto incrementing key because it's possible that <Text>
      // is rendered inside array as sibling
      return <Text key={i++}>{node}</Text>;
    }

    // render unknown tag using <View>
    // ideally you also filter valid props to <View />
    return <View {...props}>{children}</View>;
  },
};

class NativeHTMLRenderer extends React.Component {
  render() {
    return convert(this.props.html, { transform });
  }
}
```

### preserveAttributes

By default `htmr` will convert attribute to camelCase version because that's what react uses. You can override this behavior by passing `preserveAttributes` options. Specify array of string / regular expression to test which attributes you want to preserve.

For example you want to make sure `ng-if`, `v-if` and `v-for` to be rendered as is

```js
convert(html, { preserveAttributes: ['ng-if', new RegExp('v-')] });
```

### dangerouslySetChildren

By default `htmr` will only render children of `style` tag inside `dangerouslySetInnerHTML` due to security reason. You can override this behavior by passing array of HTML tags if you want the children of the tag to be rendered dangerously.

```js
convert(html, { dangerouslySetChildren: ['code', 'style'] });
```

**Note** that if you still want `style` tag to be rendered using `dangerouslySetInnerHTML`, you still need to include it in the array.

## Multiple children

You can also convert HTML string which contains multiple elements. This returns
an array, so make sure to wrap the output inside other component such as div, or
use React 16.

```js
import React from 'react';
import convert from 'htmr';

const html = `
  <h1>This string</h1>
  <p>Contains multiple html tags</p>
  <p>as sibling</p>
`;

class Component extends React.Component {
  render() {
    // if using react 16, simply use the return value because
    // v16 can render array
    return convert(html);
    // if using react 15 and below, wrap in another component
    return <div>{convert(html)}</div>;
  }
}
```

## Use Cases

This library was initially built to provides easy component mapping between HTML
string and React component. It's mainly used in my blog to render custom
component from HTML string returned from blog API. This library **prioritize
file size and simple API** over full HTML conversion coverage and other features
like flexible node traversal.

That's why I've decided to not implement some features (see **Trade Off**
section below). If you feel like you need more features that's not possible
using this library, you can check out some related projects below.

## Trade Off

* Inline event attributes (`onclick=""` etc) are not supported due to unnecessary complexity
* htmr use native browser HTML parser when run in browser instead of using custom parser. Due to how browser HTML parser works, you can get weird result if you supply "invalid" html, for example `div` inside `p` element like `<p><div>text</div></p>`
* Script tag is not rendered using `dangerouslySetInnerHTML` by default due to security. You can opt in by using [`dangerouslySetChildren`](#dangerouslysetchildren)
* Style tag renders it children using `dangerouslySetInnerHTML` by default. You can also reverse this behavior using same method.

## Related projects

HTML to react element:

* [html-to-react](https://github.com/aknuds1/html-to-react)
* [react-html-parser](https://github.com/wrakky/react-html-parser)
* [html-react-parser](https://github.com/remarkablemark/html-react-parser)
* [react-render-html](https://github.com/noraesae/react-render-html)

HTML (page) to react component (file/string):

* [html-to-react-components](https://github.com/roman01la/html-to-react-components)
* [react-magic](https://github.com/reactjs/react-magic)

## License

MIT
