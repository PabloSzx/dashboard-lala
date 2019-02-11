import { omit, isEmpty } from "lodash";
import { GET_USER } from "../types";

export default (
  state = { program: "programita", programaId: 17008 },
  { type, payload }
) => {
  const auth = omit(payload, "error");

  switch (type) {
    case GET_USER:
      return isEmpty(auth) ? state : auth;
    default:
      return state;
  }
};
