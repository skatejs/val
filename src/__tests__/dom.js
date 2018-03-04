// @jsx h

import { h } from '..';

function empty (value) {
  expect(value == null).toEqual(true);
}

test('creating elements by local name', () => {
  expect(<input />.nodeName).toEqual('INPUT');
  expect(<test />.nodeName).toEqual('TEST');
  expect(<custom-element />.nodeName).toEqual('CUSTOM-ELEMENT');
});

test('creating elements by function', () => {
  const Fn = () => <div />;
  expect(<Fn />.nodeName).toEqual('DIV');
});

test('setting attributes', () => {
  const div = <div
    aria-test='aria something'
    attr-aria-who="Tony Hawk"
    attr-who="Tony Hawk"
    attr-deck="birdhouse"
    attr-rating={10}
    data-test='data something'
    test1='test something'
    test2={1}
  />;
  expect(div.hasAttribute('aria-test')).toEqual(true);
  expect(div.hasAttribute('data-test')).toEqual(true);
  expect(div.hasAttribute('test1')).toEqual(false);
  expect(div.hasAttribute('test2')).toEqual(false);

  expect(div.hasAttribute('aria-who')).toEqual(true);
  expect(div.hasAttribute('who')).toEqual(true);
  expect(div.hasAttribute('deck')).toEqual(true);
  expect(div.hasAttribute('rating')).toEqual(true);

  expect(div['aria-test']).toEqual(undefined);
  expect(div['data-test']).toEqual(undefined);
  expect(div.test1).toEqual('test something');
  expect(div.test2).toEqual(1);

  empty(div['aria-who']);
  empty(div.who);
  empty(div.deck);
  empty(div.rating);
});

test('setting events', () => {
  const click = (e) => { e.target.clickTriggered = true; };
  const custom = (e) => { e.target.customTriggered = true; };
  const dom = <div onClick={click} onCustom={custom} />;

  dom.dispatchEvent(new Event('click'));
  dom.dispatchEvent(new CustomEvent('custom'));

  expect(dom.clickTriggered).toEqual(true);
  expect(dom.customTriggered).toEqual(true);
});

test('creating with children', () => {
  const dom = (
    <div>
      <span>test</span>
    </div>
  );
});
