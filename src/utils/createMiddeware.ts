import { Resolver, GraphQLMiddlewareFunc } from "./../types/graphql-utils.d";
export const createMiddleware = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFunc: Resolver
) => {
  console.log("createMiddleware!");
  console.log(middlewareFunc, resolverFunc);
  return (parent: any, args: any, context: any, info: any) =>
    middlewareFunc(resolverFunc, parent, args, context, info);
};
