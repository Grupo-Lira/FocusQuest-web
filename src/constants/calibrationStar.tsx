export type CalibrationTarget = {
  id: string;
  label: string;
  top: number;
  left: number;
  row: number;
  column: number;
};

export const CLICKS_PER_CALIBRATION_TARGET = 5;

// A rota começa no centro e percorre a tela no sentido horário para orientar a criança.
// Todas as nove regiões originais continuam presentes na calibração.
export const calibrationTargets: ReadonlyArray<CalibrationTarget> = [
  { id: "center", label: "centro da galáxia", top: 50, left: 50, row: 2, column: 2 },
  // Mantém espaço acima do halo animado, que tem aproximadamente 6.5rem de diâmetro.
  {
    id: "top-left",
    label: "canto superior esquerdo",
    top: 12,
    left: 3,
    row: 1,
    column: 1,
  },
  { id: "top-center", label: "topo da galáxia", top: 12, left: 50, row: 1, column: 2 },
  {
    id: "top-right",
    label: "canto superior direito",
    top: 12,
    left: 95,
    row: 1,
    column: 3,
  },
  { id: "middle-right", label: "lado direito", top: 50, left: 95, row: 2, column: 3 },
  {
    id: "bottom-right",
    label: "canto inferior direito",
    top: 90,
    left: 95,
    row: 3,
    column: 3,
  },
  { id: "bottom-center", label: "base da galáxia", top: 90, left: 50, row: 3, column: 2 },
  {
    id: "bottom-left",
    label: "canto inferior esquerdo",
    top: 90,
    left: 3,
    row: 3,
    column: 1,
  },
  { id: "middle-left", label: "lado esquerdo", top: 50, left: 3, row: 2, column: 1 },
] as const;
