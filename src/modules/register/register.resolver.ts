import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
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
        email,
        password: hashedPassword,
      });

      await user.save();

      return null;
    },
  },
};
