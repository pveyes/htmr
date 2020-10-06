import { HtmrOptions as Options } from './src/types';
import { ReactNode } from 'react';

export default function htmr(html: string, options?: Partial<Options>): ReactNode

export type HtmrOptions = Partial<Options>