import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import * as Redis from "ioredis";
import { getConnection } from "typeorm";

import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { User } from "./entity/User";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/${folder}.resolver`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/${folder}.schema.graphql`)
    );

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  // create an instance of redis
  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
    }),
  });

  // GET route for confirm message
  server.express.get("/confirm/:id", async (req, res, _) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({ confirmed: true })
        .where("id = :id", { id: userId });

      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

  // Connect to the database
  await createTypeORMConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`🎉 Server is running on port 4000`);

  return app;
};
