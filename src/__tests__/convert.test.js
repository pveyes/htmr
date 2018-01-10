/* eslint-env jest */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import renderer from 'react-test-renderer';
import convertServer from '../server';
import convertBrowser from '../browser';

testRender('convert correctly', () => {
  const html = '<p id="test">This is cool</p>';
  return { html };
});

testRender('supports valid html attribute', () => {
  const html = `
    <div data-type="calendar" aria-describedby="info">
      <link xml:lang="en" xlink:actuate="" />
      <svg fill-rule="evenodd" color-interpolation-filters="">
        <path fill="#fa0"></path>
      </svg>
    </div>
  `;

  return { html };
});

testRender('unsafe html attributes', () => {
  const html = '<label class="input-text" for="name"></div>';
  return { html };
});

testRender('self closing component', () => {
  const html = `
    <div>
      <img src="https://www.google.com/logo.png" />
      <iframe src="https://www.youtube.com/embed/I2-_iLzmkVw"></iframe>
    </div>
  `;

  return { html };
});

testRender('multi children', () => {
  const html = `
    <p>Multi</p>
    <p>Component</p>
  `;

  return { html, multi: true };
});

testRender('element inside text node', () => {
  const html = 'what are <strong>you</strong> doing?';
  return { html, multi: true };
});

testRender('convert style values', () => {
  const html = `
    <div style="margin: 0 auto; padding: 0 10px">
      <span style="font-size: 12"></span>
    </div>
  `;

  return { html };
});

testRender('css vendor prefixes', () => {
  const html = `
    <div style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%">
      prefix
    </div>
  `;

  return { html };
});

testRender('css html entities', () => {
  const html = `
    <div style="font-family: Consolas, &quot;Liberation Mono &quot;">
    </div>
  `;

  return { html };
});

testRender('ignore invalid style', () => {
  const html =
    '<div class="component-overflow" style="TITLE_2">Explore Categories</div>';
  return { html };
});

testRender('ignore partially invalid style', () => {
  const html =
    '<div class="component-overflow" style="TITLE_2; color:\'red\'">Explore Categories</div>';
  return { html };
});

testRender('style with url & protocol', () => {
  const html = `
    <div class="tera-promo-card--header" style="background-image:url(https://d1nabgopwop1kh.cloudfront.net/xx);"></div>
  `;

  return { html };
});

testRender('preserve child of style tag', () => {
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

  return { html };
});

testRender('unescape html entities', () => {
  const html = '<div class="entities">&amp; and &</div>';
  return { html };
});

testRender('ignore comment', () => {
  const html = `
    <!-- comment should be ignored-->
    <div>no comment</div>
  `;

  return { html };
});

testRender('ignore multiline html comment', () => {
  const html = `
    <!--<div>\n<p>multiline</p> \t</div>-->
    <div>no multiline comment</div>
  `;

  return { html };
});

testRender('custom component', () => {
  const html = '<p data-custom="true">Custom component</p>';

  const Paragraph = ({ children, ...props }) => (
    <p {...props} className="css-x243s">
      {children}
    </p>
  );

  return { html, map: { p: Paragraph } };
});

/**
 * Test utilities
 */

function testRender(label, render) {
  test(label, () => {
    const { html, map, multi } = render();
    let server = convertServer(html, map);
    let browser = convertBrowser(html, map);

    if (multi) {
      server = <div>{server}</div>;
      browser = <div>{browser}</div>;
    }

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
  });
}
