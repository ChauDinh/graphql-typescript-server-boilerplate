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
import { confirmRoute } from "./routes/confirmEmail";
import { redisSessionPrefix } from "./constants";
import { createTestConnection } from "./testUtils/createTestConnection";

const SESSION_SECRET = "bnjm39k0Ldf9XXedn";
const RedisStore = connectRedis(session as any);

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

  const server = new GraphQLServer({
    schema: generateSchema() as any,
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
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    } as any)
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
  server.express.get("/confirm/:id", confirmRoute);

  // Connect to the database
  if (process.env.NODE_ENV === "test") {
    await createTestConnection(true);
  } else {
    await createTypeORMConnection();
  }

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log(`🎉 Server is running on port 4000`);

  return app;
};
