import DOMPurify from 'dompurify';

export const sanitizeText = (text?: string): string => {
  return DOMPurify.sanitize(text ?? '', {
    ALLOWED_TAGS: [
      'b',
      'i',
      'u',
      'a',
      'p',
      's',
      'br',
      'span',
      'strong',
      'em',
      'code',
      'pre',
      'ul',
      'ol',
      'li'
    ]
  });
};
