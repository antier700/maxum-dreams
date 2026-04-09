export const TOKEN_KEY = "token";
export const USER_KEY = "user";

export const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const removeToken = (): void =>
  localStorage.removeItem(TOKEN_KEY);

export const getUser = <T>(): T | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setUser = (user: unknown): void =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeUser = (): void =>
  localStorage.removeItem(USER_KEY);

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};
