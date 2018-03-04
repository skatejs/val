# Val

[![Travis][build-badge]][build]

[build-badge]: https://img.shields.io/travis/skatejs/val/master.png
[build]: https://travis-ci.org/skatejs/val

## Better VDOM / DOM integration

The goal of this wrapper is to provide a consistent interface across all virtual DOM solutions that provide a hyperscript-style virtual DOM function, and also provide a default interface for creating real DOM. This includes, but is not limited to:

- React
- Preact
- Virtual DOM
- Hyperscript (any implementation)
- Real DOM
- ...

```sh
npm install @skatejs/val
```

## Rationale

The problems these different implemenations face is that the only common thing is the function that you invoke and the arguments that it accepts, at a top level. However, they all behave differently with the arguments you give them.

For example, React will only set props on DOM elements that are in its whitelist. Preact will set props on DOM elements if they are `in element`. There's problems with each of these.

The problem with React is that you can't pass complex data structures to DOM elements that have properties that aren't in their whitelist, which every web component would be subject to.

With Preact, it's mostly good. However, the assumption is that your custom element definition is defined prior to Preact creating the DOM element in its virtual DOM implementation. This will fail if your custom element definitions are loaded asynchronously, which is not uncommon when wanting to defer the loading of non-critical resources.

Theres other issues such as React not working at all with custom events.

## Solution

The best solution I've come across so far is to create a wrapper that works for any of these. The wrapper enables several things:

- Ability to pass a custom element constructor as the node name (first argument)
- Bind events using the `onEventName` syntax. The `on` is removed and the first character is lower-cased: `eventName`.
- Props are passed if they're found on the element or they have a prefix of `$`.
- Everything else is passed as an attribute.

## Requirements

This assumes that whatever library you're wrapping has support for a `ref` callback as a common way for us to get access to the raw DOM element that we need to use underneath the hood.

## Usage

The usage is simple. You import the wrapper and invoke it with the only argument being the virtual DOM function that you want it to wrap.

React:

```js
import { createElement } from 'react';
import val from '@skatejs/val';

export default val(createElement);
```

Preact:


```js
import { h } from 'preact';
import val from '@skatejs/val';

export default val(h);
```

In your components, you'd then import your wrapped function instead of the one from the library.

```js
/** @jsx h */

import h from 'your-wrapper';
import { PureComponent } from 'react';
import { render } from 'react-dom';

class WebComponent extends HTMLElement {}
class ReactComponent extends PureComponent {
  render () {
    return <WebComponent />;
  }
}

render(<ReactComponent />, document.getElementById('root'));
```

### Real DOM

Val ships with a default adapter that generates real DOM nodes. To do this, simply import the `h` function:

```js
/** @jsx h*/
import { h } from '@skatejs/val';

// <div>test</div>
console.log(<div>test</div>.outerHTML);
```

Everything works as advertised, so you can still pass custom elements, attributes and events as you normally would and things just work.

Being able to do this is immensely useful for testing real DOM and web components. Apply liberally!

### Custom element constructors

You can also use your web component constructor instead of the name that was passed to `customElements.define()`.

```js
// So we have the reference to pass to h().
class WebComponent extends HTMLElement {}

// It must be defined first.
customElements.define('web-component', WebComponent);

// Now we can use it.
h(WebComponent);
```

### Properties

Properties are anything that is found in the element, or is prefixed with a `$`. The former works on most use-cases where the element has the property defined on its prototype. The latter is for use-cases where this may not be possible, such as custom elements that haven't been defined yet.

```js
h('my-element', {
  someProp: true,
  $someProp: true
});
```

### Events and custom events

Events are bound by prefixing the event name you want to bind with `on` and upper-casing the first character. The `on` is then removed and the first character of the event name is lower-cased. This is so that the event name is preserved as closely as possible to the original case.

```js
import h from 'your-wrapper';

h('my-element', {
  onClick () {},
  onCustomevent () {}
});
```

### Attributes

Attributes are specified using the `attrs` object.

```js
import h from 'your-wrapper';

h('my-element', {
  myattribute: 'some value'
});
```
