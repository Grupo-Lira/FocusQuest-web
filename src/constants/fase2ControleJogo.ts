export enum ControleEnum {
  CONTROLE_ARDUINO = "CONTROLE_ARDUINO",
  CONTROLE_MOUSE = "CONTROLE_MOUSE",
}

export function executarPorTipoDeControle(
  controle: ControleEnum,
  funcoes: Record<ControleEnum, () => void>
) {
  //Executa conforme a função do controle selecionado
  funcoes[controle]();
}
