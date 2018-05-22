# htmr [![Build Status](https://travis-ci.org/pveyes/htmr.svg?branch=master)](https://travis-ci.org/pveyes/htmr) [![bundle size](http://img.badgesize.io/https://unpkg.com/htmr/lib/htmr.min.js?compression=gzip)](https://unpkg.com/htmr/lib/htmr.min.js)

[![Greenkeeper badge](https://badges.greenkeeper.io/pveyes/htmr.svg)](https://greenkeeper.io/)

> Simple and lightweight HTML to react component converter

Convert HTML string to React component using simple API that works universally
in server and browser in a small package (< 2kB minified gzipped)

## Install

```sh
$ yarn add htmr

# or

$ npm install htmr --save
```

## Usage

Usage is quite straightforward, use the default export, and pass HTML string.

```js
import React from 'react';
import convert from 'htmr';

class Component extends React.Component {
  render() {
    return convert('<p>No more dangerouslySetInnerHTML</p>');
  }
}
```

The API also accepts second argument `options` containing few fields

```js
const options = {
  map: {},
  preserveAttributes: [],
};
convert(html, options);
```

### map

map accepts key value object that maps tagName (key) to Component (value). You can use it to render specific tag name using custom component. For example: component with
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

const map = {
  p: Paragraph,
};

class Component extends React.Component {
  render() {
    // will return <Paragraph>{'Custom component'}</Paragraph>
    return convert('<p>Custom component</p>', { map });
  }
}
```

You can also use component mapping to achieve more things, like
[attaching event handler](https://gist.github.com/pveyes/be1da04bdbf57d6e487daf4b596af7cd#file-eventhandler-js),
[map component by its HTML attribute](https://gist.github.com/pveyes/be1da04bdbf57d6e487daf4b596af7cd#file-mapcomponentbyattribute-js).

`map` also accepts default component mapper using underscore `_` syntax, similar to [pattern matching](https://reasonml.github.io/docs/en/pattern-matching.html) default handler:

```js
const map = {
  _: (node, props, children) => {
    // returns react element
    // defaults to `return node` for text node / string
    // and `return React.createElement(node, props, children)` for HTML node
    if (typeof props === 'undefined') {
      return node;
    }

    return React.createElement(node, props, children);
  },
};
convert(html, { map });
```

This can be useful if you want to do string preprocessing (like removing all whitespace), or rendering HTML as native view in [react-native](https://github.com/facebook/react-native):

```js
import React from 'react';
import { Text, View } from 'react-native';

let i = 0;

const map = {
  // react-native uses View instead of div
  div: View,
  _: (node, props, children) => {
    // react-native can't render string without <Text> component
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
    return convert(this.props.html, { map });
  }
}
```

### preserveAttributes

By default `htmr` will convert attribute to camelCase version because that's what react uses. You can override this behavior by passing `preserveAttributes` options. Specify array of string / regular expression to test which attributes you want to preserve.

For example you want to make sure `ng-if`, `v-if` and `v-for` to be rendered as is

```js
convert(html, { preserveAttributes: ['ng-if', new RegExp('v-')] });
```

### Multiple children

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
    // if using react 16
    return convert(html);
    // if using react 15 and below
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
* Script tag is not rendered using `dangerouslySetInnerHTML` by default due to security. You can opt in by using [custom component mapping](#custom-component)
* Style tag renders it children using `dangerouslySetInnerHTML` by default. You can also reverse this behavior using custom mapping.

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
