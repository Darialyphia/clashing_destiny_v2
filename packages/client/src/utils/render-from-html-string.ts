import { h, resolveComponent, type Component, type VNodeChild } from 'vue';

export function renderFromHtml(html: string): () => VNodeChild {
  return function render(): VNodeChild {
    const template = document.createElement('template');
    template.innerHTML = html.trim();

    const children = Array.from(template.content.childNodes)
      .map(nodeToVNode)
      .filter((x): x is VNodeChild => x !== null);

    if (children.length === 0) return '';
    if (children.length === 1) return children[0];
    return children;
  };
}

function nodeToVNode(node: Node): VNodeChild | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (!text.trim()) return null;
    return text;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as Element;

  // localName is safer than tagName here
  const tag = el.localName;

  const props = elementAttributesToProps(el);

  const children = Array.from(el.childNodes)
    .map(nodeToVNode)
    .filter((x): x is VNodeChild => x !== null);

  const target = isNativeHtmlTag(tag) ? tag : resolveComponent(tag);

  return h(target as string | Component, props, children);
}

function elementAttributesToProps(el: Element): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name;
    const value = attr.value;

    if (
      name.startsWith('v-') ||
      name.startsWith(':') ||
      name.startsWith('@') ||
      name.startsWith('#')
    ) {
      continue;
    }

    if (isBooleanAttribute(name)) {
      props[name] = value === '' ? true : value !== 'false';
      continue;
    }

    if (name === 'style') {
      props.style = parseInlineStyle(value);
      continue;
    }

    if (name === 'class') {
      props.class = value;
      continue;
    }

    props[name] = coerceAttributeValue(value);
  }

  return props;
}

function parseInlineStyle(style: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const part of style.split(';')) {
    const [rawKey, ...rawValue] = part.split(':');
    if (!rawKey || rawValue.length === 0) continue;

    const key = rawKey.trim();
    const value = rawValue.join(':').trim();

    if (key) result[key] = value;
  }

  return result;
}

function coerceAttributeValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function isBooleanAttribute(name: string): boolean {
  return new Set([
    'disabled',
    'checked',
    'selected',
    'readonly',
    'multiple',
    'required',
    'autofocus',
    'hidden',
    'open'
  ]).has(name);
}

function isNativeHtmlTag(tag: string): boolean {
  return HTML_TAGS.has(tag);
}

const HTML_TAGS = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr'
]);
