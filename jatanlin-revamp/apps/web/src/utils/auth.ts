const getTokenExpiry = (token: string): number | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(window.atob(normalized)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
};

const getTokenMaxAge = (token: string, fallbackSeconds: number): number => {
  if (typeof window === 'undefined') return fallbackSeconds;
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) return fallbackSeconds;
  return Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
};

export const isAuthTokenExpired = (token: string | null) => {
  if (!token || typeof window === 'undefined') return true;
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) return true;
  return expiresAt <= Math.floor(Date.now() / 1000);
};

export const setAuthCookie = (isAuthenticated: boolean, token?: string) => {
  if (typeof window !== 'undefined') {
    const maxAge = token ? getTokenMaxAge(token, 60 * 60 * 24) : 60 * 60 * 24;
    document.cookie = `isAuthenticated=${isAuthenticated}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const setAuthTokenCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    const maxAge = getTokenMaxAge(token, 60 * 60 * 24);
    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const removeAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
    document.cookie = 'authToken=; path=/; max-age=0';
  }
};

export const getAuthTokenCookie = () => {
  if (typeof window === 'undefined') return null;

  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1] || null
  );
};
