import BRequest from "./BRequest";

/**
 * @service
 * @route /relatorios/pdf/:id
 * @http GET
 */
export const downloadRelatorioPdf = (pacienteId: string): Promise<Blob> => {
  return BRequest.download(`/relatorios/pdf/${pacienteId}`);
};
