import { describe, expect, it } from 'vitest';
import { lockout } from '../src/modules/auth/lockout';

describe('auth/lockout', () => {
  const email = 'lockout-unit@test.local';

  it('locks after 5 failures and unlocks on reset', () => {
    lockout.reset(email);
    expect(lockout.check(email)).toBe(0);

    for (let i = 0; i < 5; i++) lockout.recordFailure(email);
    expect(lockout.check(email)).toBeGreaterThan(0);

    lockout.reset(email);
    expect(lockout.check(email)).toBe(0);
  });

  it('is case-insensitive on email', () => {
    lockout.reset('Mixed@Case.Com');
    for (let i = 0; i < 5; i++) lockout.recordFailure('Mixed@Case.Com');
    expect(lockout.check('mixed@case.com')).toBeGreaterThan(0);
    lockout.reset('Mixed@Case.Com');
  });
});
