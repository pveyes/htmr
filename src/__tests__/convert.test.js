/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import snapshot from 'jest-snapshot';
import diff from 'jest-diff';

import convertServer from '../server';
import convertBrowser from '../browser';

test('convert correctly', () => {
  const html = '<p id="test">This is cool</p>';
  testRender(html);
});

test('make sure HTML is string', () => {
  const error = new Error('Expected HTML string');
  const fixtures = [null, [], {}, 1, true];

  // server & browser
  expect.assertions(fixtures.length * 2);

  fixtures.forEach(fixture => {
    expect(() => convertServer(fixture)).toThrow(error);
    expect(() => convertBrowser(fixture)).toThrow(error);
  });
});

test('supports valid html attribute', () => {
  const html = [
    '<div data-type="calendar" aria-describedby="info">',
    '<link xml:lang="en" xlink:actuate="" />',
    '<svg fill-rule="evenodd" color-interpolation-filters="">',
    '<path fill="#fa0"></path>',
    '</svg>',
    '</div>',
  ].join('');

  testRender(html);
});

test('unsafe html attributes', () => {
  const html = '<label class="input-text" for="name"></label>';
  testRender(html);
});

test('self closing component', () => {
  const html = [
    '<div>',
    '<img src="https://www.google.com/logo.png" />',
    '<iframe src="https://www.youtube.com/embed/I2-_iLzmkVw"></iframe>',
    '</div>',
  ].join('');

  testRender(html);
});

test('multi children', () => {
  const html = '<p>Multi</p><p>Component</p>';

  testRender(html);
});

test('element inside text node', () => {
  const html = 'what are <strong>you</strong> doing?';
  testRender(html);
});

test('convert style values', () => {
  const html = [
    '<div style="margin: 0 auto; padding: 0 10px">',
    '<span style="font-size: 12"></span>',
    '</div>',
  ].join('');

  testRender(html);
});

test('css vendor prefixes', () => {
  const html = `
    <div style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%">
      prefix
    </div>
  `;

  testRender(html);
});

test('css html entities', () => {
  const html =
    '<div style="font-family: Consolas, &quot;Liberation Mono &quot;"></div>';

  testRender(html);
});

test('ignore invalid style', () => {
  const html =
    '<div class="component-overflow" style="TITLE_2">Explore Categories</div>';
  testRender(html);
});

test('ignore partially invalid style', () => {
  const html =
    '<div class="component-overflow" style="TITLE_2; color:\'red\'">Explore Categories</div>';
  testRender(html);
});

test('style with url & protocol', () => {
  const html =
    '<div class="tera-promo-card--header" style="background-image:url(https://d1nabgopwop1kh.cloudfront.net/xx);"></div>';

  testRender(html);
});

test('preserve child of style tag', () => {
  const html = `
    <style>
      ul > li {
        list-style: none
      }

      div[data-id="test"]:not(.y) {
        display: none;
      }
    </style>
  `;

  testRender(html);
});

test('unescape html entities', () => {
  const html = '<div class="entities">&amp; and &</div>';
  testRender(html);
});

test('decode html entities on defaultMap', () => {
  const html = '<div class="entities">&amp; and &</div>';
  testRender(html, {
    transform: {
      _: (node, props, children) => {
        if (typeof props === 'undefined') {
          return node;
        }

        return <p>{children}</p>;
      },
    },
  });
});

test('ignore comment', () => {
  const html = '<!-- comment should be ignored--><div>no comment</div>';
  testRender(html);
});

test('ignore multiline html comment', () => {
  const html = [
    '<!--<div>\n<p>multiline</p> \t</div>-->',
    '<div>no multiline comment</div>',
  ].join('');

  testRender(html);
});

test('custom component', () => {
  const html = '<p data-custom="true">Custom component</p>';

  const Paragraph = ({ children, ...props }) => (
    <p {...props} className="css-x243s">
      {children}
    </p>
  );

  testRender(html, { transform: { p: Paragraph } });
});

test('default mapping', () => {
  const html = '<article> <p>Default mapping</p> </article>';
  let i = 0;
  const defaultMap = (node, props, children) => {
    if (typeof props === 'undefined') {
      // we need to add key for elements inside array
      return <span key={i++}>{node}</span>;
    }

    return <div {...props}>{children}</div>;
  };

  testRender(html, { transform: { _: defaultMap } });
});

test('whitespace only text nodes', () => {
  const html = '<span>Hello</span> <span>World</span>';
  testRender(html);
});

test('newline between tags', () => {
  const html = '<pre><span>Hello</span>\n<span>World</span></pre>';
  testRender(html);
});

test('decode html attributes', () => {
  const html = '<a href="https://www.google.com/?a=b&amp;c=d">test</a>';
  testRender(html);
});

test('remove whitespace on table', () => {
  const html = `
    <table>
      <tbody>
        <tr>
          <th> title</th>
        </tr>
        <tr>
          <td>entry </td>
        </tr>
      </tbody>
    </table>
  `.trim();

  testRender(html);
});

test('allow preserve some attributes', () => {
  const html = `
    <div ng-if="x">
      <div tv-abc="d" tv-xxx="y"></div>
    </div>
  `;

  testRender(html, { preserveAttributes: ['ng-if', new RegExp('tv-')] });
});

expect.extend({
  toRenderConsistently({ server, browser }, html) {
    const serverRender = renderer.create(server);
    const browserRender = renderer.create(browser);

    const serverHtml = snapshot.utils.serialize(serverRender);
    const browserHtml = snapshot.utils.serialize(browserRender);

    const diffString = diff(serverHtml, browserHtml, { expand: this.expand });
    const pass = serverHtml === browserHtml;
    let messageExpectation;

    if (pass) {
      messageExpectation =
        'Expected server rendered HTML to not equal browser rendered HTML';
    } else {
      messageExpectation =
        'Expected server rendered HTML to equal browser rendered HTML';
    }

    const message = () =>
      messageExpectation +
      '\n\n' +
      'Server render:\n' +
      `  ${this.utils.printExpected(serverHtml)}\n` +
      'Browser render:\n' +
      `  ${this.utils.printReceived(browserHtml)}\n` +
      (diffString ? `\n\nDifference:\n\n${diffString}` : '');

    return { message, pass };
  },
});

/**
 * Test utilities
 */

function testRender(html, options) {
  let server = convertServer(html, options);
  let browser = convertBrowser(html, options);

  expect({ server, browser }).toRenderConsistently(html);

  // assert snapshot, doesn't matter from server or browser
  // because we've already done assert equal between them
  expect(renderer.create(server)).toMatchSnapshot();
}
