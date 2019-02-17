import { omit, isEmpty } from "lodash";
import { GET_USER } from "../types";

export default (state = { programs: [] }, { type, payload }) => {
  const auth = omit(payload, "error");

  switch (type) {
    case GET_USER:
      return isEmpty(auth) ? state : auth;
    default:
      return state;
  }
};
