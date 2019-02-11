import axios from "axios";
import { GET_USER } from "../types";
export const getCurrentUser = () => async dispatch => {
  const res = await axios.post("/auth/current_user");

  dispatch({
    type: GET_USER,
    payload: res.data,
  });
};
