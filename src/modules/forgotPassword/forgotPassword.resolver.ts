import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { User } from "./../../entity/User";
import { forgotPasswordLockAccount } from "./../../utils/forgotPasswordLockAccount";
import { registerPasswordValidation } from "./../../yupSchema";
import { forgotPasswordPrefix } from "./../../constants";
import { ResolverMap } from "./../../types/graphql-utils.d";
import { userNotFoundError, expiredKeyError } from "./errorMessage";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { formatYupErrors } from "../../utils/formatYupErrors";

// 20 minutes
// lock account as soon as we send change account link (email)
//  - not let them login
//  - get them out of the session

const schema = yup.object().shape({
  newPassword: registerPasswordValidation,
});

export const resolver: ResolverMap = {
  Query: {
    dummy2: () => "bye",
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user)
        return [
          {
            path: "email",
            message: userNotFoundError,
          },
        ];

      await forgotPasswordLockAccount(user.id, redis);

      // TODO: Add frontend url
      await createForgotPasswordLink("", user.id, redis);

      // TODO: Send email with url

      return true;
    },

    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;

      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError,
          },
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupErrors(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        { forgotPasswordLocked: false, password: hashedPassword }
      );

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    },
  },
};
