/**
 * HTML sanitizer for admin-authored rich content.
 *
 * Policy is deliberately permissive: the admin panel is a trusted surface and
 * editors must support real embeds — iframes (YouTube/Vimeo/Spotify/maps),
 * tables, figures, inline styles, classes. So instead of an allowlist of a
 * handful of tags, we keep everything except the handful of things that can
 * actually execute code or hijack the document:
 *
 *   - <script>, <base>, <meta>, <link>  — removed outright
 *   - on* attributes (onclick, onerror, …) — stripped
 *   - javascript:/vbscript:/data: URLs   — stripped (data:image/* is kept, so
 *                                          pasted inline images survive)
 *
 * Note that scripts injected through innerHTML never execute in the browser
 * anyway; dropping them keeps stored content honest about what it can do.
 */

// Removed along with their contents — these are never authored content.
const DROP_ENTIRELY = new Set(['SCRIPT', 'BASE', 'META', 'LINK', 'NOSCRIPT'])

// Attributes carrying a URL, checked against the scheme rules below.
const URL_ATTRS = new Set(['href', 'src', 'srcset', 'action', 'formaction', 'poster', 'xlink:href', 'data'])

const SAFE_URL = /^(?:https?:|mailto:|tel:|ftp:|#|\/|\.\/|\.\.\/|[\w.-]+(?:\/|\?|$))/i
const SAFE_DATA_URL = /^data:image\/(?:png|jpe?g|gif|webp|avif|svg\+xml);base64,/i

function isSafeUrl(value) {
  // Control characters and stray whitespace are how `java\tscript:` slips past
  // a naive scheme check — drop them before testing (test only, never rewrite).
  const v = String(value || '').replace(/[\u0000-\u0020\u007F-\u00A0]/g, '')
  if (!v) return false
  if (v.startsWith('data:')) return SAFE_DATA_URL.test(v)
  // Reject anything with a scheme we did not explicitly bless.
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return SAFE_URL.test(v)
  return true // scheme-less: relative path, anchor, bare domain
}

function cleanAttributes(el) {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase()
    const value = attr.value

    // Event handlers of every flavour.
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name)
      continue
    }

    // srcdoc lets an iframe carry its own scripted document.
    if (name === 'srcdoc') {
      el.removeAttribute(attr.name)
      continue
    }

    if (URL_ATTRS.has(name) && !isSafeUrl(value)) {
      el.removeAttribute(attr.name)
      continue
    }

    // `style` is allowed, but not CSS that can fetch/execute.
    if (name === 'style' && /expression\s*\(|javascript:|behaviou?r\s*:|-moz-binding/i.test(value)) {
      el.removeAttribute(attr.name)
    }
  }
}

export function sanitizeHtml(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return String(html)

  // <template> parses without side effects: no image/iframe requests fire.
  const holder = document.createElement('template')
  holder.innerHTML = String(html)

  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (DROP_ENTIRELY.has(child.tagName.toUpperCase())) {
          node.removeChild(child)
          continue
        }
        cleanAttributes(child)
        walk(child)
      } else if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child)
      }
    }
  }

  walk(holder.content)
  return holder.innerHTML.trim()
}

/**
 * Strip every tag — for places that need the text only (card excerpts, meta
 * descriptions, the "(untitled)" fallbacks in admin lists).
 */
export function htmlToText(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return String(html).replace(/<[^>]*>/g, '')
  const holder = document.createElement('template')
  holder.innerHTML = sanitizeHtml(html)
  return (holder.content.textContent || '').replace(/\s+/g, ' ').trim()
}
