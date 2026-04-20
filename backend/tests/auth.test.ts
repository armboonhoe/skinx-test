import { afterEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/db/client';
import { lockout } from '../src/modules/auth/lockout';
import { createUser, uniqueEmail } from './helpers/factories';
import { authHeader, http, login } from './helpers/request';

describe('POST /api/auth/register', () => {
  const endpoint = '/api/auth/register';

  it('creates a user and returns a token + session', async () => {
    const email = uniqueEmail();
    const res = await http().post(endpoint).send({
      email,
      password: 'Valid@123',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email, name: 'New User' });
    expect(typeof res.body.token).toBe('string');

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.passwordHash).not.toBe('Valid@123');

    const sessions = await prisma.session.findMany({ where: { userId: dbUser!.id } });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].revokedAt).toBeNull();
  });

  it('sets httpOnly + SameSite=Lax cookie', async () => {
    const res = await http().post(endpoint).send({
      email: uniqueEmail(),
      password: 'Valid@123',
    });
    const cookie = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toMatch(/skinx_token=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it('rejects duplicate email with 409', async () => {
    const user = await createUser();
    const res = await http().post(endpoint).send({
      email: user.email,
      password: 'Another@123',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it.each([
    ['short', 'Ab1!', 'Password must be at least 8 characters'],
    ['no letter', '12345678!', 'Password must contain at least one letter'],
    ['no digit', 'abcdefg!', 'Password must contain at least one number'],
    ['no symbol', 'abcd1234', 'Password must contain at least one symbol'],
  ])('rejects weak password (%s) with 400', async (_label, password, expectedMsg) => {
    const res = await http().post(endpoint).send({
      email: uniqueEmail(),
      password,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details.password).toEqual(
      expect.arrayContaining([expect.stringContaining(expectedMsg)]),
    );
  });

  it('rejects malformed email with 400', async () => {
    const res = await http().post(endpoint).send({
      email: 'not-an-email',
      password: 'Valid@123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details.email).toBeTruthy();
  });
});

describe('POST /api/auth/login', () => {
  const endpoint = '/api/auth/login';

  afterEach(() => {
    // In-memory lockout state persists across tests; reset to keep isolation.
    lockout.reset('locktest@test.local');
  });

  it('returns token on valid credentials', async () => {
    const user = await createUser();
    const res = await http().post(endpoint).send({
      email: user.email,
      password: user.plainPassword,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(user.email);
  });

  it('rejects wrong password with 401', async () => {
    const user = await createUser();
    const res = await http().post(endpoint).send({
      email: user.email,
      password: 'wrong-password!',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects unknown email with 401 (same as wrong password — no enumeration)', async () => {
    const res = await http().post(endpoint).send({
      email: uniqueEmail(),
      password: 'anything@1',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('locks the account after 5 failed attempts', async () => {
    const email = 'locktest@test.local';
    await createUser({ email });

    for (let i = 0; i < 5; i++) {
      const res = await http().post(endpoint).send({ email, password: 'wrong!' });
      expect(res.status).toBe(401);
    }

    const locked = await http().post(endpoint).send({ email, password: 'wrong!' });
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');

    // Correct password is still blocked while locked
    const blocked = await http().post(endpoint).send({ email, password: 'Valid@123' });
    expect(blocked.status).toBe(429);
  });

  it('resets failure counter on successful login', async () => {
    const user = await createUser();

    await http().post(endpoint).send({ email: user.email, password: 'wrong!' }).expect(401);
    await http().post(endpoint).send({ email: user.email, password: 'wrong!' }).expect(401);
    await http()
      .post(endpoint)
      .send({ email: user.email, password: user.plainPassword })
      .expect(200);

    // After success, subsequent failures count from zero — shouldn't lock immediately
    for (let i = 0; i < 3; i++) {
      await http().post(endpoint).send({ email: user.email, password: 'wrong!' }).expect(401);
    }
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the active session so the token can no longer be used', async () => {
    const user = await createUser();
    const token = await login(user.email, user.plainPassword);

    await http().get('/api/auth/me').set(authHeader(token)).expect(200);

    await http().post('/api/auth/logout').set(authHeader(token)).expect(204);

    const afterLogout = await http().get('/api/auth/me').set(authHeader(token));
    expect(afterLogout.status).toBe(401);
  });

  it('requires auth', async () => {
    const res = await http().post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user', async () => {
    const user = await createUser({ name: 'Alice' });
    const token = await login(user.email, user.plainPassword);

    const res = await http().get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: user.email, name: 'Alice' });
  });

  it('rejects a structurally valid but unsigned token (bad signature)', async () => {
    const bogus = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4IiwiZW1haWwiOiJhQGIuY29tIn0.bad';
    const res = await http().get('/api/auth/me').set(authHeader(bogus));
    expect(res.status).toBe(401);
  });

  it('accepts token via cookie as well as Authorization header', async () => {
    const user = await createUser();
    const token = await login(user.email, user.plainPassword);

    const res = await http().get('/api/auth/me').set('Cookie', `skinx_token=${token}`);
    expect(res.status).toBe(200);
  });
});
