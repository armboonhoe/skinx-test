import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('preserves the tags used by seed posts', () => {
    const input =
      '<b>Headline</b><br/><p>Body text.</p><ol><li>one</li></ol><ul><li>a</li></ul>';
    const out = sanitizeHtml(input);
    expect(out).toContain('<b>Headline</b>');
    expect(out).toContain('<p>Body text.</p>');
    expect(out).toContain('<ol>');
    expect(out).toContain('<ul>');
  });

  it('strips <script> tags', () => {
    const out = sanitizeHtml('<p>hello</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert');
    expect(out).toContain('<p>hello</p>');
  });

  it('strips inline event handlers', () => {
    const out = sanitizeHtml('<p onmouseover="alert(1)">text</p>');
    expect(out).not.toContain('onmouseover');
    expect(out).toContain('text');
  });

  it('strips style attributes', () => {
    const out = sanitizeHtml('<p style="color:red">text</p>');
    expect(out).not.toContain('style=');
  });

  it('strips javascript: URL scheme in href', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('strips data: URL scheme in href', () => {
    const out = sanitizeHtml('<a href="data:text/html,<script>x</script>">x</a>');
    expect(out).not.toContain('data:');
  });

  it('rewrites anchor links with target=_blank + rel=noopener noreferrer', () => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('removes <iframe>', () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe>');
    expect(out).not.toContain('<iframe');
  });

  it('returns empty string for all-disallowed input', () => {
    const out = sanitizeHtml('<script>x</script><style>y</style>');
    expect(out.trim()).toBe('');
  });
});
