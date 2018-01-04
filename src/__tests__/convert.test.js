/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import convertServer from '../server';
import convertBrowser from '../browser';

describe('server', () => {
  suite(convertServer);
});

describe('browser', () => {
  suite(convertBrowser);
});

describe('universal API', () => {
  test('single element', () => {
    serverBrowserCompare('<p id="test">This is cool</p>');
  });

  test('self closing', () => {
    const html = `
      <div>
        <img src="https://www.google.com/logo.png" />
        <iframe src="https://www.youtube.com/embed/I2-_iLzmkVw"></iframe>
      </div>
    `;
    serverBrowserCompare(html);
  });

  test('multi element', () => {
    const html = `
      <!-- comment should be ignored-->
      <p style="margin: 0px">Multi</p>
      <p style="display: none">Component</p>
    `;
    serverBrowserCompare(html, {}, true);
  });

  test('element inside text node', () => {
    const html = `
      what are <strong>you</strong> doing?
    `;

    serverBrowserCompare(html, {}, true);
  });

  test('unescape html entities', () => {
    const html = '&amp; and &';
    serverBrowserCompare(html);
  });

  test('custom component', () => {
    const html = '<p data-custom="true">Custom component</p>';
    const Paragraph = ({ children, ...props }) => (
      <p {...props} className="css-x243s">
        {children}
      </p>
    );

    const nodeMap = { p: Paragraph };
    serverBrowserCompare(html, nodeMap);
  });
});

// delete all key property on the given object
function deleteKey(obj) {
  delete obj.key;

  if (obj.props && obj.props.children) {
    obj.props.children.forEach(child => {
      deleteKey(child);
    });
  }
}

// Compare component object without comparing instance and key
// key props is not reused in React client rehydration, so we can
// ignore it
function jsonc(obj) {
  const result = JSON.parse(JSON.stringify(obj));
  deleteKey(result);
  return result;
}

function serverBrowserCompare(html, nodeMap, useWrapper) {
  let htmlServer = convertServer(html);
  let htmlBrowser = convertBrowser(html);

  if (useWrapper) {
    htmlServer = <div>{htmlServer}</div>;
    htmlBrowser = <div>{htmlBrowser}</div>;
  }

  expect(jsonc(htmlBrowser)).toEqual(jsonc(htmlServer));
}

function suite(converter) {
  test('ignore comment', () => {
    const html = `
      <!-- comment should be ignored-->
      <div>no comment</div>
    `;
    const content = converter(html);

    const tree = renderer.create(content);
    expect(tree).toMatchSnapshot();
  });

  test('ignore multiline html comment', () => {
    const html = `
      <!--<div>\n<p>multiline</p> \t</div>-->
      <div>no multiline comment</div>
    `;
    const content = converter(html);

    const tree = renderer.create(content);
    expect(tree).toMatchSnapshot();
  });

  test('convert correctly', () => {
    const html = '<p id="test">This is cool</p>';
    const content = converter(html);

    const tree = renderer.create(content);
    expect(tree).toMatchSnapshot();
  });

  test('unescape html entities', () => {
    const html = '<div class="entities">&amp; and &</div>';
    const content = converter(html);

    const tree = renderer.create(content);
    expect(tree).toMatchSnapshot();
  });

  test('self closing component', () => {
    const html = `
      <div>
        <img src="https://www.google.com/logo.png" />
        <iframe src="https://www.youtube.com/embed/I2-_iLzmkVw"></iframe>
      </div>
    `;

    const content = converter(html);
    const tree = renderer.create(content);
    expect(tree).toMatchSnapshot();
  });

  test('custom component', () => {
    const html = '<p data-custom="true">Custom component</p>';

    const Paragraph = ({ children, ...props }) => (
      <p {...props} className="css-x243s">
        {children}
      </p>
    );

    const nodeMap = { p: Paragraph };
    const content = converter(html, nodeMap);
    const tree = renderer.create(content);

    expect(tree).toMatchSnapshot();
  });

  test('multi children', () => {
    const html = `
      <p style="margin: 0px">Multi</p>
      <p style="display: none">Component</p>
    `;
    const content = converter(html);

    const tree = renderer.create(<div className="wrapper">{content}</div>);

    expect(tree).toMatchSnapshot();
  });

  test('element inside text node', () => {
    const html = `
      what are <strong>you</strong> doing?
    `;
    const content = converter(html);
    const tree = renderer.create(<div className="wrapper">{content}</div>);

    expect(tree).toMatchSnapshot();
  });
}
