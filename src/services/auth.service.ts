import BRequest from "./BRequest";
import { Auth } from "@/types/auth.types";

export type AuthResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * @service
 * @route /auth/login
 * @http POST
 */
export const login = async (
  credentials: Auth.Login.Body
): Promise<AuthResult<Auth.Login.Response>> => {
  try {
    const data = await BRequest.post("/auth/login", credentials);
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro ao fazer login",
    };
  }
};

/**
 * @service
 * @route /auth/register
 * @http POST
 */
export const register = async (
  credentials: Auth.Register.Body
): Promise<AuthResult<null>> => {
  try {
    await BRequest.post("/auth/register", credentials);
    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro ao registrar",
    };
  }
};
