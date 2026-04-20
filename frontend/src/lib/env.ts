import 'server-only';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
if (!BACKEND_API_URL) {
  throw new Error('BACKEND_API_URL is required');
}

export const env = {
  BACKEND_API_URL,
};
