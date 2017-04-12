import expect from 'expect';
import val from 'src';

const { customElements, Event, HTMLElement } = window;

describe('Val', () => {
  it('should take a function', () => {
    const fn = val(() => {});
    expect(fn).toBeA('function');
  });

  it('h() (no arguments) basic argument shapes', () => {
    const fn = val((...args) => args);
    const args = fn();
    
    expect(args.length).toBe(2);
    expect(args[0]).toBe('div');
    expect(args[1]).toBeAn('object');

    const props = args[1];

    expect(Object.getOwnPropertyNames(props)).toInclude('ref');
    expect(Object.getOwnPropertyNames(props)).toInclude('dangerouslySetInnerHTML');
    expect(props.ref).toBeA('function');
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
