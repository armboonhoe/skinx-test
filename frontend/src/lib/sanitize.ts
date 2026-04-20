import 'server-only';
import sanitizeHtmlLib from 'sanitize-html';

const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    'p',
    'br',
    'b',
    'strong',
    'i',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'blockquote',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

export const sanitizeHtml = (dirty: string): string => sanitizeHtmlLib(dirty, OPTIONS);
