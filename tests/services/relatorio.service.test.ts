import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadRelatorioPdf } from "@/services/relatorio.service";
import BRequest from "@/services/BRequest";

vi.mock("@/services/BRequest", () => ({
  default: {
    download: vi.fn(),
  },
}));

describe("relatorio.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve solicitar o download do laudo PDF via GET /relatorios/pdf/:id", async () => {
    const mockBlob = new Blob(["fake-pdf-content"], { type: "application/pdf" });
    vi.mocked(BRequest.download).mockResolvedValueOnce(mockBlob);

    const result = await downloadRelatorioPdf("paciente_123");

    expect(BRequest.download).toHaveBeenCalledWith("/relatorios/pdf/paciente_123");
    expect(result).toBe(mockBlob);
  });
});
