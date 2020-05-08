import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { invalidLogin, notConfirmEmail } from "./errorMessage";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin,
  },
];

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye 2",
  },

  Mutation: {
    login: async (_, args: GQL.ILoginOnMutationArguments, { session }) => {
      // try to find the user with the given email
      const { email, password } = args;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: notConfirmEmail,
          },
        ];
      }

      // check the password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return errorResponse;
      }

      // login successful, create cookie for user
      session.userId = user.id;

      return null;
    },
  },
};