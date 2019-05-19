export const CollectingHandler: any;
export class DefaultHandler {
  constructor(callback: any, options: any, elementCB: any);
  dom: any;
  oncdataend(): void;
  oncdatastart(): void;
  onclosetag(): void;
  oncomment(data: any): void;
  oncommentend(): void;
  onend(): void;
  onerror(error: any): void;
  onopentag(name: any, attribs: any): void;
  onparserinit(parser: any): void;
  onprocessinginstruction(name: any, data: any): void;
  onreset(): void;
  ontext(data: any): void;
}
export class DomHandler {
  constructor(callback: any, options: any, elementCB: any);
  dom: any;
  oncdataend(): void;
  oncdatastart(): void;
  onclosetag(): void;
  oncomment(data: any): void;
  oncommentend(): void;
  onend(): void;
  onerror(error: any): void;
  onopentag(name: any, attribs: any): void;
  onparserinit(parser: any): void;
  onprocessinginstruction(name: any, data: any): void;
  onreset(): void;
  ontext(data: any): void;
}
export const DomUtils: any;
export const EVENTS: {
  attribute: number;
  cdataend: number;
  cdatastart: number;
  closetag: number;
  comment: number;
  commentend: number;
  end: number;
  error: number;
  opentag: number;
  opentagname: number;
  processinginstruction: number;
  text: number;
};
export namespace ElementType {
  const CDATA: string;
  const Comment: string;
  const Directive: string;
  const Doctype: string;
  const Script: string;
  const Style: string;
  const Tag: string;
  const Text: string;
  function isTag(elem: any): any;
}
export const FeedHandler: any;
export class Parser {
  constructor(cbs: any, options: any);
  startIndex: any;
  endIndex: any;
  addListener(type: any, listener: any): any;
  done(chunk: any): void;
  emit(type: any, args: any): any;
  end(chunk: any): void;
  eventNames(): any;
  getMaxListeners(): any;
  listenerCount(type: any): any;
  listeners(type: any): any;
  off(type: any, listener: any): any;
  on(type: any, listener: any): any;
  onattribdata(value: any): void;
  onattribend(): void;
  onattribname(name: any): void;
  oncdata(value: any): void;
  once(type: any, listener: any): any;
  onclosetag(name: any): void;
  oncomment(value: any): void;
  ondeclaration(value: any): void;
  onend(): void;
  onerror(err: any): void;
  onopentagend(): void;
  onopentagname(name: any): void;
  onprocessinginstruction(value: any): void;
  onselfclosingtag(): void;
  ontext(data: any): void;
  parseChunk(chunk: any): void;
  parseComplete(data: any): void;
  pause(): void;
  prependListener(type: any, listener: any): any;
  prependOnceListener(type: any, listener: any): any;
  rawListeners(type: any): any;
  removeAllListeners(type: any, ...args: any[]): any;
  removeListener(type: any, listener: any): any;
  reset(): void;
  resume(): void;
  setMaxListeners(n: any): any;
  write(chunk: any): void;
}
export const ProxyHandler: any;
export const RssHandler: any;
export const Stream: any;
export class Tokenizer {
  constructor(options: any, cbs: any);
  end(chunk: any): void;
  getAbsoluteIndex(): any;
  pause(): void;
  reset(): void;
  resume(): void;
  write(chunk: any): void;
}
export const WritableStream: any;
export function createDomStream(cb: any, options: any, elementCb: any): any;
export function parseDOM(data: any, options: any): any;
export function parseFeed(feed: any, options: any): any;
