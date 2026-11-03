export type PhaseOneTarget = {
  id: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

// Percentages of the play field. Each target stays centered in its screen zone,
// while leaving separation between regions to reduce ambiguous gaze hits.
// The backend normalizes these same bounds without expanding them.
export const PHASE_ONE_REGIONS = [
  { id: 1, label: "Canto superior esquerdo", left: 6, top: 5, width: 38, height: 40 },
  { id: 2, label: "Canto inferior direito", left: 56, top: 55, width: 38, height: 40 },
  { id: 3, label: "Centro da galáxia", left: 30, top: 29, width: 40, height: 42 },
  { id: 4, label: "Canto superior direito", left: 56, top: 5, width: 38, height: 40 },
  { id: 5, label: "Canto inferior esquerdo", left: 6, top: 55, width: 38, height: 40 },
] as const;

// Keep 1 Hz: the backend also uses sample counts to classify deviations.
export const PHASE_ONE_GAZE_INTERVAL_MS = 1000;
export const PHASE_ONE_SAMPLE_MAX_AGE_MS = 1500;

export function buildPhaseOneTargets(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  viewportWidth: number,
  viewportHeight: number,
): PhaseOneTarget[] {
  return PHASE_ONE_REGIONS.map(({ id, left, top, width, height }) => ({
    id,
    x_min: (rect.left + rect.width * left / 100) / viewportWidth,
    x_max: (rect.left + rect.width * (left + width) / 100) / viewportWidth,
    y_min: (rect.top + rect.height * top / 100) / viewportHeight,
    y_max: (rect.top + rect.height * (top + height) / 100) / viewportHeight,
  }));
}
