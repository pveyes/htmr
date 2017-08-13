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
      <p style="margin: 0px">Multi</p>
      <p style="display: none">Component</p>
    `;
    serverBrowserCompare(html, {}, true);
  });

  test('custom component', () => {
    const html = '<p data-custom="true">Custom component</p>';
    const Paragraph = ({ children, ...props }) =>
      <p {...props} className="css-x243s">
        {children}
      </p>;

    const nodeMap = { p: Paragraph };
    serverBrowserCompare(html, nodeMap);
  });
});

function serverBrowserCompare(html, nodeMap, useWrapper) {
  const htmlServer = convertServer(html);
  const htmlBrowser = convertBrowser(html);

  if (useWrapper) {
    expect(
      renderer
        .create(
          <div>
            {htmlServer}
          </div>
        )
        .toJSON()
    ).toEqual(
      renderer
        .create(
          <div>
            {htmlBrowser}
          </div>
        )
        .toJSON()
    );
    return;
  }

  expect(renderer.create(htmlServer).toJSON()).toEqual(
    renderer.create(htmlBrowser).toJSON()
  );
}

function suite(converter) {
  test('convert correctly', () => {
    const html = '<p id="test">This is cool</p>';
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

    const Paragraph = ({ children, ...props }) =>
      <p {...props} className="css-x243s">
        {children}
      </p>;

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

    const tree = renderer.create(
      <div className="wrapper">
        {content}
      </div>
    );

    expect(tree).toMatchSnapshot();
  });
}
