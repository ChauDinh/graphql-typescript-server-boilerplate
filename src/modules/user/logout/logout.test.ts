import { createTestConnection } from "../../../testUtils/createTestConnection";
import { Connection } from "typeorm";
import * as faker from "faker";

import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
// import { createTestConnection } from "./../../jestGlobalSetup/createTestConnection";

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

describe("Test logout", () => {
  test("test logging out an account, multiple sessions", async () => {
    // device 1 (ex: computer)
    const session1 = new TestClient(process.env.TEST_HOST as string);
    // device 2 (ex: phone)
    const session2 = new TestClient(process.env.TEST_HOST as string);

    await session1.login(email, password);
    await session2.login(email, password);
    expect(await session1.me()).toEqual(await session2.me());

    // logout on session1
    await session1.logout();
    expect(await session1.me()).toEqual(await session2.me());
  });
  test("test logging out an account, single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    //   STEP 1: login success and send cookie
    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });

    // STEP 2: logout success
    await client.logout();

    // STEP 3: check whether cookie (userId) exits in redis
    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});
