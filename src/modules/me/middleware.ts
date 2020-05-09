import { Resolver } from "./../../types/graphql-utils.d";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  console.log("called!");
  if (!context.session || !context.session.userId) {
    throw Error("no cookie");
  }
  return resolver(parent, args, context, info);
};
