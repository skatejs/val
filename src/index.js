const { customElements } = window;
const cacheCtorLocalNames = new Map();
const cacheElementEventHandlers = new WeakMap();
const EVENT_REGEX = /^on[A-Z]/;

// Override customElements.define() to cache constructor local names. This is
// required for all virtual DOM implementations that don't natively support
// custom element constructors as node names.
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
function applyAttr (e, name, value) {
  if (value == null) {
    e.removeAttribute(name);
  } else {
    e.setAttribute(name, value);
  }
}

function applyEvent (e, name, value) {
  let handlers = cacheElementEventHandlers.get(e);
  if (!handlers) {
    handlers = {};
    cacheElementEventHandlers.set(e, handlers);
  }

  e.removeEventListener(name, handlers[name]);
  e.addEventListener(name, handlers[name] = value);
}

// Ensures attrs, events and props are all set as the consumer intended.
function ensureAttrs (objs) {
  const { ref, key, dangerouslySetInnerHTML, ...props } = objs || {};
  const newRef = ensureRef(ref, props);
  const obj = { ref: newRef, key };

  // React.Fragment doesn't support this prop.
  if (dangerouslySetInnerHTML != null) {
    obj.dangerouslySetInnerHTML = dangerouslySetInnerHTML;
  }

  return obj;
}

// Ensures a ref is supplied that set each member appropriately and that
// the original ref is called.
function ensureRef (ref, props) {
  return e => {
    if (e) {
      Object.keys(props).forEach(name => {
        // Since all special prefixes are 5 chars in length, we can do this
        // instead of calling indexOf() several times.
        const firstPart = name.substring(0, 5);
        const value = props[name];
        if (firstPart === 'aria-' || firstPart === 'data-') {
          applyAttr(e, name, value);
        } else if (firstPart === 'attr-') {
          applyAttr(e, name.substring(5), value);
        } else if (name.match(EVENT_REGEX)) {
          applyEvent(e, name[2].toLowerCase() + name.substring(3), value);
        } else {
          e[name] = value;
        }
      });
    }

    if (ref) {
      ref(e);
    }
  };
}

// Returns the custom element local name if it exists or the original
// value.
function ensureLocalName (lname) {
  const temp = cacheCtorLocalNames.get(lname);
  return temp || lname;
}

// Default adapter for rendering DOM.
function defaultCreateElement (lname, { ref, ...attrs }, ...chren) {
  const node = typeof lname === 'function' ? new lname() : document.createElement(lname);
  ref(node);
  chren.forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

// Provides a function that takes the original createElement that is being
// wrapped. It returns a function that you call like you normally would.
//
// It requires support for:
// - `ref(element)`
export default function val (createElement = defaultCreateElement) {
  return function (lname, attrs, ...chren) {
    lname = ensureLocalName(lname);
    attrs = ensureAttrs(attrs);
    return createElement(lname, attrs, ...chren);
  };
}

export const h = val();
