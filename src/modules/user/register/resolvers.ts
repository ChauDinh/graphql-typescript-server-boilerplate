import { registerPasswordValidation } from "../../../yupSchema";
import * as yup from "yup";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { formatYupErrors } from "../../../utils/formatYupErrors";
import {
  emailNotLongEnough,
  invalidEmail,
  duplicateEmail,
} from "./errorMessage";

const schema = yup.object().shape({
  email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
  password: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, {
          abortEarly: false,
        });
      } catch (error) {
        return formatYupErrors(error);
      }
      const { email, password } = args;

      const isUserAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (isUserAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail,
          },
        ];
      }

      const user = User.create({
        email,
        password,
      });

      await user.save();

      return null;
    },
  },
};
