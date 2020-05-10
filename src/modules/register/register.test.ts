import { TestClient } from "./../../utils/TestClient";
import { Connection } from "typeorm";

import { User } from "../../entity/User";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "./errorMessage";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";

/**
 * TODO:
 *
 * use a test database
 * drop all data once the test is over
 * when I run yarn test it also starts the server
 */

const email = "bob1@bob1.com";
const password = "123abc";

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeORMConnection();
});
afterAll(async () => {
  conn.close();
});

describe("Register user", () => {
  it("Check for duplicated email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // make sure we can register new user
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // try to sign up again with the same account, duplicated email
    const response2: any = await client.register(email, password);
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: "already taken",
    });
  });

  it("Check for bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response3: any = await client.register("b", password);
    expect(response3.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough,
        },
        {
          path: "email",
          message: invalidEmail,
        },
      ],
    });
  });

  it("Check for bad password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response4: any = await client.register(email, "b");
    expect(response4.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough,
        },
      ],
    });
  });

  it("Check for bad email and bad password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response5: any = await client.register("a", "a");
    expect(response5.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough,
        },
        {
          path: "email",
          message: invalidEmail,
        },
        {
          path: "password",
          message: passwordNotLongEnough,
        },
      ],
    });
  });
});
