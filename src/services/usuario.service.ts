import BRequest from "./BRequest";
import { User } from "@/types/usuario.types";

/**
 * @service
 * @route /usuarios
 * @http GET
 */
export const getMyProfile = (): Promise<User.GetMyProfile.Response> => {
  return BRequest.get("/usuarios");
};

/**
 * @service
 * @route /usuarios
 * @http PUT
 */
export const updateMyProfile = (
  data: User.UpdateProfile.Body
): Promise<User.UpdateProfile.Response> => {
  return BRequest.put("/usuarios", data);
};
