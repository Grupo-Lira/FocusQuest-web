import BRequest from "./BRequest";
import { Paciente } from "@/types/paciente.types";

/**
 * @service
 * @route /pacientes
 * @http POST
 */
export const createPaciente = (
  data: Paciente.CreatePaciente.Body
): Promise<Paciente.CreatePaciente.Response> => {
  return BRequest.post("/pacientes", data);
};

/**
 * @service
 * @route /pacientes
 * @http GET
 */
export const listPacientes = (): Promise<Paciente.ListPacientes.Response> => {
  return BRequest.get("/pacientes");
};

/**
 * @service
 * @route /pacientes/:nome
 * @http GET
 */
export const getPaciente = (nome: string): Promise<Paciente.GetPaciente.Response> => {
  return BRequest.get(`/pacientes/${nome}`);
};

/**
 * @service
 * @route /pacientes/:nome
 * @http PUT
 */
export const updatePaciente = (
  nome: string,
  data: Paciente.UpdatePaciente.Body
): Promise<Paciente.UpdatePaciente.Response> => {
  return BRequest.put(`/pacientes/${nome}`, data);
};

/**
 * @service
 * @route /pacientes/:nome
 * @http DELETE
 */
export const deletePaciente = (nome: string): Promise<void> => {
  return BRequest.delete(`/pacientes/${nome}`);
};
