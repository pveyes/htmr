# htmr [![Build Status](https://travis-ci.org/pveyes/htmr.svg?branch=master)](https://travis-ci.org/pveyes/htmr) [![bundle size](http://img.badgesize.io/https://unpkg.com/htmr/lib/htmr.min.js?compression=gzip)](https://unpkg.com/htmr/lib/htmr.min.js)

> Simple and lightweight HTML to react component converter

Convert HTML string to React component using simple API that works universally in
server and browser in a small package (< 2kB minified gzipped)

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
    return convert('<p>No more dangerouslySetInnerHTML</p>')
  }
}
```

### Custom component

You can also map element to custom component, for example component with predefined
styles such as [emotion](https://github.com/tkh44/emotion) / [styled-components](https://github.com/styled-components/styled-components).

```js
import React from 'react';
import convert from 'htmr';
import styled from 'emotion/react';

const Paragraph = styled('p')`
  font-family: Helvetica, Arial, sans-serif;
  line-height: 1.5;
`;

// map is key value object that maps tagName (key) to Component (value)
const map = {
  p: Paragraph,
};

class Component extends React.Component {
  render() {
    // will return <Paragraph>{'Custom component'}</Paragraph>
    return convert('<p>Custom component</p>', map);
  }
}
```

You can also use component mapping to achieve more things, like [attaching event
handler](https://gist.github.com/pveyes/be1da04bdbf57d6e487daf4b596af7cd#file-eventhandler-js), [map component by its HTML attribute](https://gist.github.com/pveyes/be1da04bdbf57d6e487daf4b596af7cd#file-mapcomponentbyattribute-js), and much more. This is a simple
yet powerful API.

### Multiple children

You can also convert HTML string which contains multiple elements. This returns
an array, so make sure to wrap the output inside other component such as div,
or use React 16.

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
string and React component. It's mainly used in my blog to render custom component
from HTML string returned from blog API. This library **prioritize file size and simple
API** over full HTML conversion coverage and other features like flexible node traversal.

That's why I've decided to not implement some features (see **Trade Off** section
below). If you feel like you need more features that's not possible using this library,
you can check out some related projects below.

## Related projects

HTML to react element:

 - [html-to-react](https://github.com/aknuds1/html-to-react)
 - [react-html-parser](https://github.com/wrakky/react-html-parser)
 - [html-react-parser](https://github.com/remarkablemark/html-react-parser)
 - [react-render-html](https://github.com/noraesae/react-render-html)

HTML (page) to react component (file/string):

 - [roman01la/html-to-react-components](https://github.com/roman01la/html-to-react-components)
 - [react-magic](https://github.com/reactjs/react-magic)

## Trade Off
 - Inline event attributes (`onclick=""` etc) are not supported due to unnecessary complexity

## License

MIT
