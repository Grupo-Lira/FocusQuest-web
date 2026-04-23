import BRequest from "./BRequest";
import { Doctor } from "@/types/doctor.types";

/**
 * @service
 * @route /doutores/me
 * @http GET
 */
export const getMyProfile = (): Promise<Doctor.GetMyProfile.Response> => {
  return BRequest.get("/doutores/me");
};

/**
 * @service
 * @route /doutores/me
 * @http PUT
 */
export const updateMyProfile = (
  data: Doctor.UpdateProfile.Body
): Promise<Doctor.UpdateProfile.Response> => {
  return BRequest.put("/doutores/me", data);
};

/**
 * @service
 * @route /doutores
 * @http POST
 */
export const createProfile = (
  data: Doctor.CreateProfile.Body
): Promise<Doctor.CreateProfile.Response> => {
  return BRequest.post("/doutores", data);
};
