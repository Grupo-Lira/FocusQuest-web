const TOKEN_KEY = "focusquest.authToken" as const;

const isBrowser = () => typeof window !== "undefined";

export const saveAuthToken = (token: string) => {
  if (isBrowser() === false) return;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Strict`;
};

export const getAuthToken = () => {
  if (isBrowser() === false) return null;
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${TOKEN_KEY}=`));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

export const clearAuthToken = () => {
  if (isBrowser() === false) return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`;
};
