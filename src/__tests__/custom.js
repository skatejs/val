// @jsx h

import val, { h } from '..';

test('should take a function', () => {
  const fn = val(() => {});
  expect(typeof fn).toEqual('function');
});

test('h(nodeName)', () => {
  expect(val(name => name)('test')).toBe('test');
});

test('h(nodeName, { prop, attrs, events })', () => {
  let triggered = false;
  const fn = val((name, props) => {
    const el = document.createElement(name);
    props.ref(el);
    return el;
  });
  const div = fn('div', {
    prop: true,
    attrs: { attr: true },
    events: { customevent: () => (triggered = true) }
  });

  expect(div.prop).toBe(true);
  expect(div.getAttribute('attr')).toBe('true');

  div.dispatchEvent(new Event('customevent'));
  expect(triggered).toBe(true);
});

customElements && test('custom element constructor', () => {
  class Test extends HTMLElement {}
  customElements.define('x-test', Test);
  expect(val(ctor => ctor)(Test)).toBe('x-test');
});

test('h(nodeName, { key })', () => {
  expect(val((name,props) => props)('test', { key: 'foo' }).key).toBe('foo');
});

test('h(nodeName, { dangerouslySetInnerHTML })', () => {
  const div = val((name,props) => props)('div', {
      dangerouslySetInnerHTML: 'foo'
  });

  expect(div.dangerouslySetInnerHTML).toBe('foo');
});
