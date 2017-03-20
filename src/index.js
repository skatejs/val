
const { customElements } = window;
const cacheCtorLocalNames = new Map();
const cacheElementEventHandlers = new WeakMap();

// Override customElements.define() to cache constructor local names.
if (customElements) {
  const { define } = customElements;
  customElements.define = (name, Ctor) => {
    cacheCtorLocalNames.set(Ctor, name);
    return define.call(customElements, name, Ctor);
  };
}

// Applies attributes to the ref element. It doesn't traverse through
// existing attributes and assumes that the supplied object will supply
// all attributes that the applicator should care about, even ones that
// should be removed.
function applyAttrs (e, attrs) {
  Object.keys(attrs || {}).forEach(name => {
    const value = attrs[name];
    if (value == null) {
      e.removeAttribute(name);
    } else {
      e.setAttribute(name, value);
    }
  });
}

function applyEvents (e, events) {
  const handlers = cacheElementEventHandlers.get(e) || {};
  cacheElementEventHandlers.set(e, events = events || {});

  // Remove any old listeners that are different - or aren't specified
  // in - the new set.
  Object.keys(handlers).forEach(name => {
    if (handlers[name] && handlers[name] !== events[name]) {
      e.removeEventListener(name, handlers[name]);
    }
  });

  // Bind new listeners.
  Object.keys(events || {}).forEach(name => {
    if (events[name] !== handlers[name]) {
      e.addEventListener(name, events[name]);
    }
  });
}

// Sets props. Straight up.
function applyProps (e, props) {
  Object.keys(props || {}).forEach(name => {
    e[name] = props[name];
  });
}

// Ensures that if a ref was specified that it's called as normal.
function applyRef (e, ref) {
  if (ref) {
    ref(e);
  }
}

// Ensures attrs, events and props are all set as the consumer intended.
function ensureAttrs (name, objs) {
  const { attrs, events, ref, ...props } = objs || {};
  const newRef = ensureRef({ attrs, events, props, ref });
  return { ref: newRef };
}

// Ensures a ref is supplied that set each member appropriately and that
// the original ref is called.
function ensureRef ({ attrs, events, props, ref }) {
  return e => {
    if (e) {
      applyAttrs(e, attrs);
      applyEvents(e, events);
      applyProps(e, props);
    }
    applyRef(e, ref);
  };
}

// Returns the custom element local name if it exists or the original
// value.
function ensureLocalName (lname) {
  const temp = cacheCtorLocalNames.get(lname);
  return temp || lname;
}

// Provides a function that takes the original createElement that is being
// wrapped. It returns a function that you call like you normally would.
//
// It requires support for:
// - `ref`
export default function (createElement) {
  return function (lname = 'div', attrs, ...chren) {
    lname = ensureLocalName(lname);
    attrs = typeof lname === 'string' ? ensureAttrs(lname, attrs) : attrs;
    return createElement(lname, attrs, ...chren);
  };
}
