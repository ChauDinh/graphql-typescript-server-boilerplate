import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { v4 } from "uuid";

import { sendConfirmEmail } from "./../../utils/sendConfirmEmail";
import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupErrors } from "./../../utils/formatYupErrors";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "./errorMessage";
import { createConfirmEmailLink } from "./../../utils/createConfirmEmailLink";

const schema = yup.object().shape({
  email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
  password: yup.string().min(6, passwordNotLongEnough).max(255),
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
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

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        id: v4(),
        email,
        password: hashedPassword,
      });

      await user.save();

      if (process.env.NODE_ENV !== "test") {
        // create and send a confirm email link
        await sendConfirmEmail(
          email,
          await createConfirmEmailLink(url, user.id, redis)
        );
      }

      return null;
    },
  },
};
