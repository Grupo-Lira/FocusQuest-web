const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AUTH_BASE_PATH = "/api/auth" as const;
const DEFAULT_ERROR_MESSAGE = "Não foi possível completar a requisição." as const;

export type AuthCredentials = {
  email: string;
  senha: string;
};

export type AuthResult<T> = {
  data: T | null;
  error: string | null;
};

type LoginResponse = {
  token: string;
};

type ApiErrorBody = {
  error?: string;
};

const parseErrorMessage = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  if (body !== null && typeof body.error === "string") return body.error;
  return DEFAULT_ERROR_MESSAGE;
};

const postJson = async <TResponse>(
  path: string,
  payload: unknown,
): Promise<AuthResult<TResponse>> => {
  const response = await fetch(`${API_URL}${AUTH_BASE_PATH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok === false) {
    const error = await parseErrorMessage(response);
    return { data: null, error };
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json") === false) {
    return { data: null, error: null };
  }

  const data = (await response.json()) as TResponse;
  return { data, error: null };
};

export const login = (credentials: AuthCredentials) => {
  return postJson<LoginResponse>("/login", credentials);
};

export const register = (credentials: AuthCredentials) => {
  return postJson<null>("/register", credentials);
};
