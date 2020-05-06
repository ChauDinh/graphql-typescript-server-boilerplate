import { generateSchema } from "./utils/generateSchema";
import { GraphQLServer } from "graphql-yoga";

import { redis } from "./redis";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import confirmRoute from "./routes/confirmEmail.route";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
    }),
  });

  // GET route for confirm message
  server.express.use("/confirm", confirmRoute);

  // Connect to the database
  await createTypeORMConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`🎉 Server is running on port 4000`);

  return app;
};
