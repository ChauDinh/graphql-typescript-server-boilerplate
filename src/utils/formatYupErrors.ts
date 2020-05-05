import { ValidationError } from "yup";

export const formatYupErrors = (error: ValidationError) => {
  const errors: Array<{ path: String; message: String }> = [];
  error.inner.forEach((e) => {
    errors.push({
      path: e.path,
      message: e.message,
    });
  });

  return errors;
};
