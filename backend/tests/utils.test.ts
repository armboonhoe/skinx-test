import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/utils/hash';
import { signJwt, verifyJwt } from '../src/utils/jwt';

describe('utils/hash', () => {
  it('hashes and verifies a password round-trip', async () => {
    const hash = await hashPassword('my-secret-password');
    expect(hash).not.toBe('my-secret-password');
    expect(await verifyPassword('my-secret-password', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('produces different hashes for the same input (salt)', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
  });
});

describe('utils/jwt', () => {
  it('signs and verifies a payload with sub, email, jti', () => {
    const token = signJwt({ sub: 'u1', email: 'a@b.com', jti: 's1' });
    const payload = verifyJwt(token);
    expect(payload).toEqual(expect.objectContaining({ sub: 'u1', email: 'a@b.com', jti: 's1' }));
  });

  it('rejects a tampered token', () => {
    const token = signJwt({ sub: 'u1', email: 'a@b.com', jti: 's1' });
    const tampered = token.slice(0, -4) + 'xxxx';
    expect(() => verifyJwt(tampered)).toThrow();
  });

  it('rejects a token missing jti', () => {
    expect(() => verifyJwt('not.a.jwt')).toThrow();
  });
});
