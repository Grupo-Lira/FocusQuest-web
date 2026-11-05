import { describe, expect, it, vi } from "vitest";
import {
  ControleEnum,
  executarPorTipoDeControle,
} from "@/constants/fase2ControleJogo";

describe("fase2ControleJogo", () => {
  it("deve executar a função correspondente ao controle Arduino", () => {
    const fnArduino = vi.fn();
    const fnMouse = vi.fn();

    executarPorTipoDeControle(ControleEnum.CONTROLE_ARDUINO, {
      [ControleEnum.CONTROLE_ARDUINO]: fnArduino,
      [ControleEnum.CONTROLE_MOUSE]: fnMouse,
    });

    expect(fnArduino).toHaveBeenCalledOnce();
    expect(fnMouse).not.toHaveBeenCalled();
  });

  it("deve executar a função correspondente ao controle Mouse", () => {
    const fnArduino = vi.fn();
    const fnMouse = vi.fn();

    executarPorTipoDeControle(ControleEnum.CONTROLE_MOUSE, {
      [ControleEnum.CONTROLE_ARDUINO]: fnArduino,
      [ControleEnum.CONTROLE_MOUSE]: fnMouse,
    });

    expect(fnMouse).toHaveBeenCalledOnce();
    expect(fnArduino).not.toHaveBeenCalled();
  });
});
