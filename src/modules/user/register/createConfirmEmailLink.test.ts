import { createTestConnection } from "../../../testUtils/createTestConnection";
import { Connection } from "typeorm";
import * as Redis from "ioredis";
import fetch from "node-fetch";
import * as faker from "faker";

import { User } from "../../../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";

let userId = "";
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password(),
  }).save();

  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("Create confirm email link", () => {
  it("Make sure createConfirmEmailLink works and clear key in redis", async () => {
    const link = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId as string,
      redis
    );

    const response = await fetch(link);
    const text = await response.text();
    expect(text).toEqual("ok");

    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();

    const chunks = link.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
