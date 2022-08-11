import { HtmrOptions as Options } from './src/types';

export default function htmr(
  html: string,
  options?: Partial<Options>
): JSX.Element;

export type HtmrOptions = Partial<Options>;
