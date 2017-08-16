/* eslint-env jest */
import { hypenColonToCamelCase as convert } from '../utils';

test('convert hypen to camel case', () => {
  expect(convert('margin-top')).toEqual('marginTop');
  expect(convert('fill-rule')).toEqual('fillRule');
  expect(convert('color-interpolation-filters')).toEqual(
    'colorInterpolationFilters'
  );
});

test('convert colon to camel case', () => {
  expect(convert('xlink:actuate')).toEqual('xlinkActuate');
  expect(convert('xml:lang')).toEqual('xmlLang');
});
