export const setAuthCookie = (isAuthenticated: boolean) => {
  if (typeof window !== 'undefined') {
    document.cookie = `isAuthenticated=${isAuthenticated}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }
};

export const setAuthTokenCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 3}; SameSite=Lax`;
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
