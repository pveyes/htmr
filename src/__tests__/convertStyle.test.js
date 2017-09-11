/* eslint-env jest */
import convertStyle from '../convertStyle';

test('basic conversion', () => {
  const style = 'display: none; margin: 10px';
  expect(convertStyle(style)).toMatchSnapshot();
});

test('vendor prefixes', () => {
  const style = '-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%';
  expect(convertStyle(style)).toMatchSnapshot();
});

test('html entities', () => {
  const style =
    'font-family: Consolas, &quot;Liberation Mono&quot;, Menlo, Courier, monospace';
  expect(convertStyle(style)).toMatchSnapshot();
});
