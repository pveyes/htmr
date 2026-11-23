/* eslint-env jest */
// Property-based tests for inline style parsing.
// https://github.com/pveyes/htmr/issues/163
import mapAttribute from '../src/mapAttribute';
import htmrServer from '../src';
import htmrBrowser from '../src/index.browser';

const RUNS = 500;

// mulberry32, seeded so failures are reproducible
function prng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseStyle(style) {
  return mapAttribute('div', { style }, [], () => ({
    name: 'style',
    isBoolean: false,
  })).style;
}

// what convertValue does to a trimmed value
function expectedValue(value) {
  return /^\d+$/.test(value) ? Number(value) : value.replace(/'/g, '"');
}

const PROPS = [
  ['color', 'color'],
  ['background', 'background'],
  ['background-image', 'backgroundImage'],
  ['font-family', 'fontFamily'],
  ['content', 'content'],
  ['width', 'width'],
  ['-webkit-mask', 'WebkitMask'],
  ['-ms-transform', 'msTransform'],
  ['--custom-prop', '--custom-prop'],
  ['grid-template-areas', 'gridTemplateAreas'],
];

function makeGen(rand) {
  const int = (n) => Math.floor(rand() * n);
  const pick = (arr) => arr[int(arr.length)];
  const ws = () => pick(['', '', ' ', '  ', '\n', '\t']);
  // chars that are safe anywhere inside a quoted string of the given quote
  const quotedChars = (q) =>
    Array.from({ length: int(8) }, () =>
      pick(['a', 'b', ' ', ';', ':', '(', ')', ',', '/', q === '"' ? "'" : '"'])
    ).join('');
  const word = () =>
    pick([
      'red',
      'auto',
      'none',
      '10px',
      '1.5em',
      '50%',
      '#fff',
      'bold',
      'a-b',
    ]);

  const token = (depth = 0) => {
    const kinds = [
      () => word(),
      () => `"${quotedChars('"')}"`,
      () => `'${quotedChars("'")}'`,
      () => `url(data:image/png;base64,${pick(['AAAA', 'iVBOR=', 'x;y;z'])})`,
      () => `url("${quotedChars('"')}")`,
      () => `url('${quotedChars("'")}')`,
    ];
    if (depth < 3) {
      kinds.push(() => `calc(${token(depth + 1)} + ${token(depth + 1)})`);
      kinds.push(() => `var(--x, ${token(depth + 1)})`);
      kinds.push(() => `rgba(${int(255)}, 0, 0, ${rand().toFixed(2)})`);
    }
    return pick(kinds)();
  };

  const value = () =>
    Array.from({ length: 1 + int(3) }, () => token()).join(pick([' ', ', ']));

  return { int, pick, ws, value };
}

describe('style fuzz', () => {
  test('parses generated declarations back to what was generated', () => {
    for (let seed = 1; seed <= RUNS; seed++) {
      const { int, pick, ws, value } = makeGen(prng(seed));
      const props = [...PROPS].sort(() => int(3) - 1).slice(0, 1 + int(5));

      const expected = {};
      const parts = props.map(([cssProp, reactProp]) => {
        const v = value();
        expected[reactProp] = expectedValue(v);
        return `${ws()}${cssProp}${ws()}:${ws()}${v}${ws()}`;
      });
      // sprinkle empty declarations and an optional trailing `;`
      const style =
        parts.join(pick([';', ';', '; ;', ';;'])) + pick(['', ';', '; ']);

      const actual = parseStyle(style);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `seed ${seed}\ninput:    ${style}\nexpected: ${JSON.stringify(
            expected
          )}\nactual:   ${JSON.stringify(actual)}`
        );
      }
    }
  });

  test('server and browser builds agree on generated styles', () => {
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    for (let seed = 1; seed <= 100; seed++) {
      const { value } = makeGen(prng(seed));
      const style = `background: ${value()}; color: red`;
      const html = `<div style="${escape(style)}">x</div>`;
      expect(htmrServer(html).props.style).toEqual(parseStyle(style));
      expect(htmrBrowser(html).props.style).toEqual(parseStyle(style));
    }
  });

  test('matches plain split(";") when there are no quotes or parentheses', () => {
    const legacy = (str) => {
      const style = {};
      str
        .split(';')
        .filter((s) => s.trim() !== '')
        .forEach((d) => {
          const rules = d.split(':');
          if (rules.length > 1) {
            const k = rules[0].trim();
            style[
              k.startsWith('--')
                ? k
                : k
                    .replace(/^-ms-/, 'ms-')
                    .replace(/(-|:)(.)/g, (m, s, c) => c.toUpperCase())
            ] = expectedValue(rules.slice(1).join(':').trim());
          }
        });
      return style;
    };

    for (let seed = 1; seed <= RUNS; seed++) {
      const rand = prng(seed);
      const alphabet = 'ab-:; \n0123456789#%.,/';
      const style = Array.from(
        { length: Math.floor(rand() * 40) },
        () => alphabet[Math.floor(rand() * alphabet.length)]
      ).join('');
      expect([style, parseStyle(style)]).toEqual([style, legacy(style)]);
    }
  });

  test('never throws and keeps every value a string or number on garbage input', () => {
    for (let seed = 1; seed <= RUNS * 4; seed++) {
      const rand = prng(seed);
      const alphabet = `ab-:;()"'\\ \n0url,`;
      const style = Array.from(
        { length: Math.floor(rand() * 60) },
        () => alphabet[Math.floor(rand() * alphabet.length)]
      ).join('');
      const result = parseStyle(style);
      Object.values(result).forEach((v) =>
        expect(['string', 'number']).toContain(typeof v)
      );
    }
  });

  test('runs in linear time on pathological input', () => {
    ['(', '"', '("', "'(", '(;', 'url('].forEach((chunk) => {
      const style = chunk.repeat(200000 / chunk.length);
      const start = Date.now();
      parseStyle(style);
      expect(Date.now() - start).toBeLessThan(1000);
    });
  });
});
