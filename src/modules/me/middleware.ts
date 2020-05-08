import { Resolver } from "./../../types/graphql-utils.d";
export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // middleware
  const result = await resolver(parent, args, context, info);

  console.log(result);
  return result;
};
