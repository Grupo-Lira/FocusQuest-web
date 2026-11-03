import { describe, expect, it } from "vitest";
import { formatDate, formatTime } from "@/utils/dateUtils";

describe("dateUtils", () => {
  describe("formatTime", () => {
    it("deve formatar 0 segundos como 00:00", () => {
      expect(formatTime(0)).toBe("00:00");
    });

    it("deve formatar segundos com zero à esquerda", () => {
      expect(formatTime(5)).toBe("00:05");
      expect(formatTime(59)).toBe("00:59");
    });

    it("deve formatar minutos e segundos corretamente", () => {
      expect(formatTime(60)).toBe("01:00");
      expect(formatTime(125)).toBe("02:05");
      expect(formatTime(3600)).toBe("60:00");
    });
  });

  describe("formatDate", () => {
    it("deve retornar hífen quando a data for nula ou indefinida", () => {
      expect(formatDate(undefined)).toBe("-");
      expect(formatDate("")).toBe("-");
    });

    it("deve formatar data ISO (com 'T') para DD/MM/AAAA", () => {
      expect(formatDate("2026-05-16T14:30:00.000Z")).toBe("16/05/2026");
      expect(formatDate("2024-01-05T00:00:00Z")).toBe("05/01/2024");
    });

    it("deve retornar a própria string quando não contiver formato ISO", () => {
      expect(formatDate("16/05/2026")).toBe("16/05/2026");
      expect(formatDate("2026-05-16")).toBe("2026-05-16");
    });
  });
});
