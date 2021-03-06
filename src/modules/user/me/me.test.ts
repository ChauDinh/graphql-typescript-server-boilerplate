import { createTestConnection } from "../../../testUtils/createTestConnection";
import { TestClient } from "../../../utils/TestClient";
import { Connection } from "typeorm";
import * as faker from "faker";

import { User } from "../../../entity/User";
// import { createTestConnection } from "./../../jestGlobalSetup/createTestConnection";

faker.seed(Date.now() + 3);
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
  userId = user.id;
});
afterAll(async () => {
  conn.close();
});

describe("Test middleware", () => {
  test("return null with no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });
  test("get current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
