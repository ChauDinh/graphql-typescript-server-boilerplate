import "reflect-metadata";
import "dotenv/config";
import { generateSchema } from "./utils/generateSchema";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";

import { redis } from "./redis";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
// import { createTestConnection } from "./jestGlobalSetup/createTestConnection";
import confirmRoute from "./routes/confirmEmail.route";
import { redisSessionPrefix } from "./constants";

const SESSION_SECRET = "bnjm39k0Ldf9XXedn";

// Create Redis store session
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request,
    }),
  });

  // Rate limiting
  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    })
  );

  // Session
  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      name: "bid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Setting CORS
  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string),
  };

  // GET route for confirm message
  server.express.use("/confirm", confirmRoute);

  // Connect to the database
  await createTypeORMConnection();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`🎉 Server is running on port 4000`);

  return app;
};
