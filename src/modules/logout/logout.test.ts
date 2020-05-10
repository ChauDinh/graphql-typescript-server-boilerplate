import { Connection } from "typeorm";
// import fetch from "node-fetch";

import { User } from "./../../entity/User";
import { createTypeORMConnection } from "./../../utils/createTypeORMConnection";
import { TestClient } from "./../../utils/TestClient";

const email = "bob5@bob5.com";
const password = "abcde12345";

let userId: string;
let conn: Connection;
beforeAll(async () => {
  conn = await createTypeORMConnection();
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
  test("test logging out an account", async () => {
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
