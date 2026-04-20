export const setAuthCookie = (isAuthenticated: boolean) => {
  if (typeof window !== 'undefined') {
    document.cookie = `isAuthenticated=${isAuthenticated}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }
};

export const removeAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
  }
};
