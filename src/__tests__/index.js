// @jsx h

import val, { h } from "..";

test("should take a function", () => {
  const fn = val(() => true);
  expect(fn()).toBe(true);
});

test("creating elements by local name", () => {
  expect(<input />.nodeName).toEqual("INPUT");
  expect(<test />.nodeName).toEqual("TEST");
  expect(<custom-element />.nodeName).toEqual("CUSTOM-ELEMENT");
});

test("creating elements by function", () => {
  const Fn = () => <div />;
  expect(<Fn />.nodeName).toEqual("DIV");
});

test("setting attributes", () => {
  const div = (
    <div
      test1="test 1"
      attrs={{
        test2: "test 2"
      }}
    />
  );
  expect(div.test1).toBe("test 1");
  expect(div.test2).toBe(undefined);
  expect(div.getAttribute("test 1")).toBe(null);
  expect(div.getAttribute("test2")).toBe("test 2");
});

test("setting events", () => {
  const click = e => {
    e.target.clickTriggered = true;
  };
  const custom = e => {
    e.target.customTriggered = true;
  };

  const dom = <div events={{ click, custom }} />;

  dom.dispatchEvent(new Event("click"));
  dom.dispatchEvent(new CustomEvent("custom"));

  expect(dom.clickTriggered).toEqual(true);
  expect(dom.customTriggered).toEqual(true);
});

test("creating with children", () => {
  const dom = (
    <div>
      <span>test</span>
    </div>
  );
});

test("pass through props", () => {
  const h = val((name, props) => props);
  expect(h("div", { prop: true }).prop).toBe(true);
});

typeof customElements !== "undefined" &&
  test("custom element constructor", () => {
    class Test extends HTMLElement {}
    customElements.define("x-test", Test);
    expect(<Test />.nodeName).toBe("x-test");
  });
