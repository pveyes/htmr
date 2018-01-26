/* eslint-env jest */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import renderer from 'react-test-renderer';
import convertServer from '../server';
import convertBrowser from '../browser';

test('convert correctly', () => {
  const html = '<p id="test">This is cool</p>';
  testRender(html);
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
  const html = '<label class="input-text" for="name"></div>';
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
    map: {
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

  testRender(html, { map: { p: Paragraph } });
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

  testRender(html, { map: { _: defaultMap } });
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

/**
 * Test utilities
 */

function testRender(html, options) {
  let server = convertServer(html, options);
  let browser = convertBrowser(html, options);

  // make sure return value is the same between server and browser
  // Expected: browser
  // Received: server
  expect(ReactDOMServer.renderToString(server)).toEqual(
    ReactDOMServer.renderToString(browser)
  );

  // assert snapshot, doesn't matter from server or browser
  // because we've already done assert equal between them
  const tree = renderer.create(server);
  expect(tree).toMatchSnapshot();
}
