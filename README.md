# htmr [![Build Status](https://travis-ci.org/pveyes/htmr.svg?branch=master)](https://travis-ci.org/pveyes/htmr)

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
styles such as emotion / styled-components.

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

## Trade Off
 - Some SVG attributes are not supported due to attribute mapping contributes to big bundle size
 - Inline event attribute (on-xxx="") are not supported due to unnecessary complexity

## License

MIT
