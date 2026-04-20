import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
}

export const signJwt = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as SignOptions);

export const verifyJwt = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.jti) {
    throw new Error('Invalid token payload');
  }
  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    jti: String(decoded.jti),
  };
};
