import { HttpError } from '@/commons/httpError';

export const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  if (!res.ok) {
    throw new HttpError(res.status, `Request failed: ${res.status}`);
  }
  return res.json();
};
