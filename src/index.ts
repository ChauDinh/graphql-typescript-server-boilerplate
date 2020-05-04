import "reflect-metadata";
import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";

import { resolvers } from "./resolvers";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

  const server = new GraphQLServer({ typeDefs, resolvers });

  // Connect to the database
  await createTypeORMConnection();
  await server.start(() =>
    console.log("🎉 Server is running on localhost:4000")
  );
};

startServer();
