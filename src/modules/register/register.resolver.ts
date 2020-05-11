import { registerPasswordValidation } from "./../../yupSchema";
import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupErrors } from "./../../utils/formatYupErrors";
import { emailNotLongEnough, invalidEmail } from "./errorMessage";

const schema = yup.object().shape({
  email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
  password: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }
    ) => {
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
            message: "already taken",
          },
        ];
      }

      const user = User.create({
        email,
        password,
      });

      await user.save();

      // if (process.env.NODE_ENV !== "test") {
      // // create and send a confirm email link
      // await sendConfirmEmail(
      // email,
      // await createConfirmEmailLink(
      // url,
      // user.id,
      // redis
      // )
      // );
      // }

      return null;
    },
  },
};
