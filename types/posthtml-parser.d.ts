export = index;
declare function index(...args: any[]): any;
declare namespace index {
  const defaultDirectives: {
    end: string;
    name: string;
    start: string;
  }[];
  const defaultOptions: {
    lowerCaseAttributeNames: boolean;
    lowerCaseTags: boolean;
  };
}
