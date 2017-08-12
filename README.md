# htmr [![Build Status](https://travis-ci.org/pveyes/htmr.svg?branch=master)](https://travis-ci.org/pveyes/htmr)

> Simple HTML to react element converter

## Install

```sh
$ yarn add htmr

# or

$ npm install htmr --save
```

## Usage

```js
const convert = require('htmr');

class Component extends React.Component {
  render() {
    return convert('<p>No more dangerouslySetInnerHtml</p>')
  }
}
```

### Custom component

```js
import React from 'react';
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
    return convert('<p>Custom component</p>', map);
  }
}
```

### Multiple children

```js
import React from 'react';

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

## License

MIT
