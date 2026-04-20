import request from 'supertest';
import { createApp } from '../../src/app';

// Shared Express instance across tests. app.ts has no side-effects on import.
export const app = createApp();
export const http = () => request(app);

export const login = async (email: string, password: string): Promise<string> => {
  const res = await http().post('/api/auth/login').send({ email, password }).expect(200);
  return res.body.token as string;
};

export const authHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});
