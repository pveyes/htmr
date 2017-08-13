/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import toReactElement from '../';

test('convert correctly', () => {
  const html = '<p id="test">This is cool</p>';
  const content = toReactElement(html);

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

  const content = toReactElement(html);
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
  const content = toReactElement(html, nodeMap);
  const tree = renderer.create(content);

  expect(tree).toMatchSnapshot();
});

test('multi children', () => {
  const html = `
    <p style="margin: 0px">Multi</p>
    <p style="display: none">Component</p>
  `;
  const content = toReactElement(html);

  const tree = renderer.create(
    <div className="wrapper">
      {content}
    </div>
  );

  expect(tree).toMatchSnapshot();
});
