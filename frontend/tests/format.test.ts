import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/format';

describe('formatDate', () => {
  it('formats an ISO string deterministically in Asia/Bangkok tz', () => {
    // 2022-01-19T04:55:25.650Z is 11:55 in Bangkok (UTC+7)
    const out = formatDate('2022-01-19T04:55:25.650Z');
    expect(out).toMatch(/19 Jan 2022/);
    expect(out).toMatch(/11:55/);
  });

  it('handles midnight UTC correctly', () => {
    const out = formatDate('2022-06-01T00:00:00.000Z');
    expect(out).toMatch(/1 Jun 2022/);
    expect(out).toMatch(/07:00/);
  });
});
