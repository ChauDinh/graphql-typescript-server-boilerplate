import { importSchema } from "graphql-import";
import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

export const generateSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "../modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/${folder}.resolver`);
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${folder}/${folder}.schema.graphql`)
    );

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return mergeSchemas({ schemas });
};
