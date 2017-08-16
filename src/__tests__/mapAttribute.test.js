/* eslint-env jest */
import mapAttribute from '../mapAttribute';

test('copy safe attributes', () => {
  const attribute = {
    id: 'nameInput',
    action: '/user/create',
    method: 'SUBMIT',
  };

  expect(mapAttribute(attribute)).toEqual(attribute);
});

test('do not change data-* and aria-* attribute', () => {
  const attribute = {
    'data-type': 'calendar',
    'aria-describedby': 'info',
  };

  expect(mapAttribute(attribute)).toEqual(attribute);
});

test("convert 'unsafe' attributes", () => {
  const attribute = {
    class: 'col-md-4',
    for: 'nameInput',
    style: 'margin: 0 auto',
  };

  expect(mapAttribute(attribute)).toMatchSnapshot();
});
