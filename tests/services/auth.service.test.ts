import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, logout, register } from "@/services/auth.service";
import BRequest from "@/services/BRequest";
import * as authStorage from "@/utils/authStorage";

vi.mock("@/services/BRequest", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("deve retornar dados e error null quando login for bem-sucedido", async () => {
      const mockResponse = { token: "token_123" };
      vi.mocked(BRequest.post).mockResolvedValueOnce(mockResponse);

      const result = await login({ email: "doutor@teste.com", senha: "senha_valida" });

      expect(BRequest.post).toHaveBeenCalledWith("/auth/login", {
        email: "doutor@teste.com",
        senha: "senha_valida",
      });
      expect(result).toEqual({ data: mockResponse, error: null });
    });

    it("deve retornar erro capturado quando login falhar", async () => {
      vi.mocked(BRequest.post).mockRejectedValueOnce(new Error("Credenciais inválidas"));

      const result = await login({ email: "doutor@teste.com", senha: "errada" });

      expect(result.data).toBeNull();
      expect(result.error).toBe("Credenciais inválidas");
    });
  });

  describe("register", () => {
    it("deve retornar data null e error null quando registro for bem-sucedido", async () => {
      vi.mocked(BRequest.post).mockResolvedValueOnce({});

      const result = await register({
        nome: "Dra. Ana",
        email: "ana@clinica.com",
        senha: "senhaSegura123",
      });

      expect(BRequest.post).toHaveBeenCalledWith("/auth/register", {
        nome: "Dra. Ana",
        email: "ana@clinica.com",
        senha: "senhaSegura123",
      });
      expect(result).toEqual({ data: null, error: null });
    });

    it("deve retornar mensagem de erro quando registro falhar", async () => {
      vi.mocked(BRequest.post).mockRejectedValueOnce(new Error("E-mail já cadastrado"));

      const result = await register({
        email: "existente@clinica.com",
        senha: "123",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe("E-mail já cadastrado");
    });
  });

  describe("logout", () => {
    it("deve chamar endpoint de logout e limpar o token de autenticação", async () => {
      const clearSpy = vi.spyOn(authStorage, "clearAuthToken");
      vi.mocked(BRequest.post).mockResolvedValueOnce({});

      const result = await logout();

      expect(BRequest.post).toHaveBeenCalledWith("/auth/logout");
      expect(clearSpy).toHaveBeenCalled();
      expect(result).toEqual({ data: null, error: null });
    });
  });
});
