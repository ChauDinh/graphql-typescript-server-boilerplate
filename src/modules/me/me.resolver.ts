import { createMiddleware } from "./../../utils/createMiddeware";
import { User } from "./../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import middleware from "./middleware";

export const resolver: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session }) =>
      User.findOne({ where: { id: session.userId } })
    ),
  },
};
