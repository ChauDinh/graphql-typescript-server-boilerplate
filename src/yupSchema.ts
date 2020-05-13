import * as yup from "yup";
import { passwordNotLongEnough } from "./modules/user/register/errorMessage";

export const registerPasswordValidation = yup
  .string()
  .min(6, passwordNotLongEnough)
  .max(255);
