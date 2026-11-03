import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPaciente,
  deletePaciente,
  getPaciente,
  listPacientes,
  updatePaciente,
} from "@/services/paciente.service";
import BRequest from "@/services/BRequest";

vi.mock("@/services/BRequest", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("paciente.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve criar paciente chamando POST /pacientes", async () => {
    const mockData = { nome: "Lucas Silva", motivo_avaliacao: "TDAH" };
    const mockRes = { data: { id: "1", ...mockData } };
    vi.mocked(BRequest.post).mockResolvedValueOnce(mockRes);

    const result = await createPaciente(mockData as any);

    expect(BRequest.post).toHaveBeenCalledWith("/pacientes", mockData);
    expect(result).toEqual(mockRes);
  });

  it("deve listar pacientes chamando GET /pacientes", async () => {
    const mockList = { data: [{ id: "1", nome: "Lucas" }] };
    vi.mocked(BRequest.get).mockResolvedValueOnce(mockList);

    const result = await listPacientes();

    expect(BRequest.get).toHaveBeenCalledWith("/pacientes");
    expect(result).toEqual(mockList);
  });

  it("deve obter detalhes do paciente por id chamando GET /pacientes/:id", async () => {
    const mockItem = { data: { id: "pac123", nome: "Lucas" } };
    vi.mocked(BRequest.get).mockResolvedValueOnce(mockItem);

    const result = await getPaciente("pac123");

    expect(BRequest.get).toHaveBeenCalledWith("/pacientes/pac123");
    expect(result).toEqual(mockItem);
  });

  it("deve atualizar paciente chamando PUT /pacientes/:id", async () => {
    const updatePayload = { nome: "Lucas Atualizado" };
    vi.mocked(BRequest.put).mockResolvedValueOnce({ data: { id: "pac123" } });

    await updatePaciente("pac123", updatePayload as any);

    expect(BRequest.put).toHaveBeenCalledWith("/pacientes/pac123", updatePayload);
  });

  it("deve deletar paciente chamando DELETE /pacientes/:id", async () => {
    vi.mocked(BRequest.delete).mockResolvedValueOnce(undefined);

    await deletePaciente("pac123");

    expect(BRequest.delete).toHaveBeenCalledWith("/pacientes/pac123");
  });
});
