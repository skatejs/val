/** @jsx h */

require('@skatejs/ssr');
const val = require('../src').default;

const { customElements, Event, HTMLElement } = window;
const h = val();

function empty (value) {
  expect(value == null).toEqual(true);
}

describe('Custom adapter', () => {
  it('should take a function', () => {
    const fn = val(() => {});
    expect(typeof fn).toEqual('function');
  });

  it('h(nodeName)', () => {
    expect(val(name => name)('test')).toBe('test');
  });

  it('h(nodeName, { prop, attrs, events })', () => {
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

  customElements && it('custom element constructor', () => {
    class Test extends HTMLElement {}
    customElements.define('x-test', Test);
    expect(val(ctor => ctor)(Test)).toBe('x-test');
  });

  it('h(nodeName, { key })', () => {
    expect(val((name,props) => props)('test', { key: 'foo' }).key).toBe('foo');
  });
});

describe('Default adapter (DOM)', () => {
  it('creating elements by local name', () => {
    expect(<input />.nodeName).toEqual('INPUT');
    expect(<test />.nodeName).toEqual('TEST');
    expect(<custom-element />.nodeName).toEqual('CUSTOM-ELEMENT');
  });

  it('creating elements by function', () => {
    const Fn = () => <div />;
    expect(<Fn />.nodeName).toEqual('DIV');
  });

  it('setting attributes', () => {
    const div = <div
      aria-test='aria something'
      data-test='data something'
      test1='test something'
      test2={1}
      attrs={{
        'aria-who': 'Tony Hawk',
        who: 'Tony Hawk',
        deck: 'birdhouse',
        rating: 10
      }}
    />;
    expect(div.hasAttribute('aria-test')).toEqual(false);
    expect(div.hasAttribute('data-test')).toEqual(false);
    expect(div.hasAttribute('test1')).toEqual(false);
    expect(div.hasAttribute('test2')).toEqual(false);

    expect(div.hasAttribute('aria-who')).toEqual(true);
    expect(div.hasAttribute('who')).toEqual(true);
    expect(div.hasAttribute('deck')).toEqual(true);
    expect(div.hasAttribute('rating')).toEqual(true);

    expect(div['aria-test']).toEqual('aria something');
    expect(div['data-test']).toEqual('data something');
    expect(div.test1).toEqual('test something');
    expect(div.test2).toEqual(1);

    empty(div['aria-who']);
    empty(div.who);
    empty(div.deck);
    empty(div.rating);
  });

  it('setting events', () => {
    const click = (e) => { e.target.clickTriggered = true; };
    const custom = (e) => { e.target.customTriggered = true; };

    const dom = <div events={{click, custom}} />;

    dom.dispatchEvent(new Event('click'));
    dom.dispatchEvent(new CustomEvent('custom'));

    expect(dom.clickTriggered).toEqual(true);
    expect(dom.customTriggered).toEqual(true);
  });
});
