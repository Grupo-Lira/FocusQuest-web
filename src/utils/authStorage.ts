const TOKEN_KEY = "focusquest.authToken" as const;

const isBrowser = () => typeof window !== "undefined";

export const saveAuthToken = (token: string) => {
  if (isBrowser() === false) return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  if (isBrowser() === false) return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token;
};

export const clearAuthToken = () => {
  if (isBrowser() === false) return;
  window.localStorage.removeItem(TOKEN_KEY);
};
