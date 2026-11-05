import BRequest from "./BRequest";

export type FeedbackProfissionalPayload = {
  fase: number;
  experimentoId: string;
  feedbackProfissional: string;
  notaDoProfissional: number;
  modoTreinamento: boolean;
};

export const salvarFeedbackProfissional = (
  payload: FeedbackProfissionalPayload,
) => BRequest.post("/estatisticas/feedback", payload);
