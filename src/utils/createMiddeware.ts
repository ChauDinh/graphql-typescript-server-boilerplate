import { Resolver, GraphQLMiddlewareFunc } from "./../types/graphql-utils.d";
export const createMiddleware = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFunc: Resolver
) => (parent: any, args: any, context: any, info: any) => {
  console.log("createMiddleware: ", context.session);
  middlewareFunc(resolverFunc, parent, args, context, info);
};
