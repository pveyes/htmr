/* eslint-env jest */
import React from 'react';
import ReactDOM from 'react-dom';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import renderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import snapshot from 'jest-snapshot';
import diff from 'jest-diff';
import { html, oneLineTrim } from 'common-tags';

import htmrServer from '../src';
import htmrBrowser from '../src/index.browser';

describe('core', () => {
  test('it works', () => {
    testRender('<p>This is cool</p>');
  });

  test('throws if first argument is not a string', () => {
    const error = new Error('Expected HTML string');
    const fixtures = [null, [], {}, 1, true];

    // server & browser
    expect.assertions(fixtures.length * 2);

    fixtures.forEach((fixture) => {
      expect(() => htmrServer(fixture)).toThrow(error);
      expect(() => htmrBrowser(fixture)).toThrow(error);
    });
  });

  test('can render self closing component', () => {
    testRender('<img src="https://www.google.com/logo.png" />');
    testRender('<hr>');
    testRender('<br />');
  });

  test('can render sibling element as multiple children', () => {
    testRender('<p>Multi</p><p>Component</p>');
  });

  test('can render element inside text node', () => {
    testRender('what are <strong>you</strong> doing?');
  });

  test('ignore comment', () => {
    testRender('<!-- comment should be ignored--><div>no comment</div>');
  });

  test('ignore multiline comment', () => {
    testRender(oneLineTrim`
      <!--<div>\n<p>multiline</p> \t</div>-->
      <li>no multiline comment</li>
    `);
  });
});

describe('attributes', () => {
  test('correctly map HTML attributes to react props', () => {
    testRender('<label class="input-text" for="name"></label>');
    testRender(
      '<div id="test" data-type="calendar" aria-describedby="info" spellcheck="true" contenteditable></div>'
    );
    testRender('<link xml:lang="en" xlink:actuate="other" />');
    testRender(oneLineTrim`
      <svg viewbox="0 0 24 24" fill-rule="evenodd" color-interpolation-filters="sRGB">
        <path fill="#ffa0"></path>
      </svg>
    `);
    testRender('<img srcset="https://img.src" crossorigin="true" />');
    testRender('<iframe srcdoc="<p>html</p>" allowfullscreen></iframe>');
    testRender(
      '<input autocomplete="on" autofocus readonly="readonly" maxlength="10" />'
    );
    testRender('<button accesskey="s">Stress reliever</button>');
    testRender('<time datetime="2018-07-07">July 7</time>');
  });

  // https://github.com/pveyes/htmr/issues/103
  test('correctly handle boolean attributes', () => {
    const { container } = render(htmrBrowser('<iframe allowfullscreen />'));
    expect(
      container.querySelector('iframe').getAttribute('allowfullscreen')
    ).toEqual('');
  });

  test('correctly convert multiple style values', () => {
    testRender('<ul style="margin: 0 auto; padding: 0 10px"></ul>');
    testRender('<span style="font-size: 12"></span>');
    testRender(
      '<div style="background-image:url(https://d1nabgopwop1kh.cloudfront.net/xx);"></div>'
    );
  });

  test('can handle css vendor prefixes', () => {
    testRender(
      '<i style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%">prefix</i>'
    );
  });

  test('decode HTML entities inside style declaration', () => {
    testRender(
      '<em style="font-family: Consolas, &quot;Liberation Mono &quot;"></em>'
    );
  });

  test('ignore invalid style', () => {
    testRender('<div style="TITLE_2">Explore Categories</div>');
    testRender('<div style="TITLE_2; color:\'red\'">Explore Categories</div>');
  });
});

describe('encoding', () => {
  test('unescape html entities', () => {
    testRender('<blockquote class="entities">&amp; and &</blockquote>');
  });

  test('decode html entities on defaultMap', () => {
    testRender('<div class="entities">&amp; and &</div>', {
      transform: {
        _: (node, props, children) => {
          if (typeof props === 'undefined') {
            return node;
          }

          return <p>{children}</p>;
        },
      },
    });
  });

  test('decode html attributes', () => {
    testRender('<a href="https://www.google.com/?a=b&amp;c=d">test</a>');
  });

  test('dangerously rendered script tag is not encoded', () => {
    const html = `
      <script data-cfasync="false" type="application/json">
        {
          "key": "value"
        }
      </script>
    `.trim();

    testRender(html, { dangerouslySetChildren: ['script'] });
  });
});

describe('options', () => {
  describe('transform', () => {
    test('custom component', () => {
      const Section = (props) => {
        const { children, 'data-heading': heading, ...rest } = props;
        return (
          <section {...rest} className="css-x243s">
            <h2>{heading}</h2>
            {children}
          </section>
        );
      };

      testRender(
        '<p data-custom="true" data-heading="Recommended">Custom component</p>',
        { transform: { p: Section } }
      );
    });

    test('default mapping', () => {
      let i = 0;
      const defaultMap = (node, props, children) => {
        if (typeof props === 'undefined') {
          // we need to add key for elements inside array
          return <span key={i++}>{node}</span>;
        }

        return <div {...props}>{children}</div>;
      };

      testRender('<article><p>Default mapping</p></article>', {
        transform: { _: defaultMap },
      });
    });
  });

  describe('preserveAttributes', () => {
    test('allow preserve some attributes', () => {
      testRender(
        html`
          <div ng-if="x">
            <div tv-abc="d" tv-xxx="y"></div>
          </div>
        `,
        { preserveAttributes: ['ng-if', new RegExp('tv-')] }
      );
    });
  });

  describe('dangerouslySetChildren', () => {
    test('preserve the content of style tag by default', () => {
      testRender(oneLineTrim`
        <style>
          ul > li {
            list-style: none
          }
    
          div[data-id="test"]:not(.y) {
            display: none;
          }
        </style>
      `);
    });

    test('should dangerously set html for required tags', () => {
      const html = oneLineTrim`
        <pre>
          &lt;a href=&quot;/&quot;&gt;Test&lt;/a&gt;
        </pre>
      `;

      testRender(html, { dangerouslySetChildren: ['pre'] });
    });

    test('no dangerously render script tag', () => {
      testRender(html`
        <script data-cfasync="false" type="text/javascript">
          var gtm4wp_datalayer_name = 'dataLayer';
          var dataLayer = dataLayer || [];
          dataLayer.push({
            pagePostType: 'post',
            pagePostType2: 'single-post',
            pageCategory: ['kalender-cuti'],
            pagePostAuthor: 'Candra Alif Irawan',
          });
        </script>
      `);
    });

    test('dangerously render empty script tag', () => {
      testRender('<script type="text/javascript"></script>', {
        dangerouslySetChildren: ['script'],
      });
    });
  });
});

describe('whitespace', () => {
  test('allow whitespace only text nodes between elements', () => {
    testRender('<span>Hello</span> <span>World</span>');
  });

  test('allow newline only text node between elements', () => {
    testRender('<pre><span>Hello</span>\n<span>World</span></pre>');
  });

  test('remove whitespace on table elements', () => {
    testRender(html`
      <table>
        <tbody>
          <tr>
            <th>title</th>
          </tr>
          <tr>
            <td>entry</td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

expect.extend({
  toRenderConsistently({ server, browser }, html) {
    const serverRender = renderer.create(server);
    const browserRender = renderer.create(browser);

    const serverHtml = snapshot.utils.serialize(serverRender);
    const browserHtml = snapshot.utils.serialize(browserRender);

    const diffString = diff(serverHtml, browserHtml, {
      expand: this.expand,
      aAnnotation: 'Server render',
      bAnnotation: 'Browser render',
    });
    const pass = serverHtml === browserHtml;
    let messageExpectation;

    if (pass) {
      messageExpectation =
        'Expected server rendered HTML to not equal browser rendered HTML';
    } else {
      messageExpectation =
        'Expected server rendered HTML to equal browser rendered HTML';
    }

    const message = () =>
      messageExpectation +
      '\n\n' +
      'Server render:\n' +
      `  ${this.utils.printExpected(serverHtml)} \n` +
      'Browser render:\n' +
      `  ${this.utils.printReceived(browserHtml)} \n` +
      (diffString ? `\n\nDifference: \n\n${diffString} ` : '');

    return { message, pass };
  },
});

/**
 * Test utilities
 */

function testRender(html, options) {
  const server = htmrServer(html, options);
  const browser = htmrBrowser(html, options);

  expect({ server, browser }).toRenderConsistently(html);

  // assert SSR
  expect(() => renderToString(server)).not.toThrow();
  expect(() => renderToStaticMarkup(server)).not.toThrow();

  // assert CSR
  const el = document.createElement('div');
  try {
    document.body.appendChild(el);
    expect(() => {
      ReactDOM.render(browser, el);
    }).not.toThrow();
  } finally {
    document.body.removeChild(el);
  }

  // assert snapshot, doesn't matter from server or browser
  // because we've already done assert equal between them
  expect(renderer.create(server)).toMatchSnapshot();
}
