import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyProfile, updateMyProfile } from "@/services/usuario.service";
import BRequest from "@/services/BRequest";

vi.mock("@/services/BRequest", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("usuario.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar o perfil do usuário logado via GET /usuarios", async () => {
    const mockProfile = { data: { nome: "Dra. Amanda", email: "amanda@teste.com" } };
    vi.mocked(BRequest.get).mockResolvedValueOnce(mockProfile);

    const result = await getMyProfile();

    expect(BRequest.get).toHaveBeenCalledWith("/usuarios");
    expect(result).toEqual(mockProfile);
  });

  it("deve atualizar os dados do perfil via PUT /usuarios", async () => {
    const updateData = { nome: "Dra. Amanda Silva", especialidade: "Neuropsicologia" };
    const mockResponse = { data: { ...updateData } };
    vi.mocked(BRequest.put).mockResolvedValueOnce(mockResponse);

    const result = await updateMyProfile(updateData as any);

    expect(BRequest.put).toHaveBeenCalledWith("/usuarios", updateData);
    expect(result).toEqual(mockResponse);
  });
});
