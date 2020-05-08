import { Connection } from "typeorm";
import { request } from "graphql-request";

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

const mutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeORMConnection();
});
afterAll(async () => {
  conn.close();
});

describe("Register user", () => {
  it("Check for duplicated email", async () => {
    // make sure we can register new user
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // try to sign up again with the same account, duplicated email
    const response2: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: "already taken",
    });
  });

  it("Check for bad email", async () => {
    const response3: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password)
    );
    expect(response3).toEqual({
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
    const response4: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "a")
    );
    expect(response4).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough,
        },
      ],
    });
  });

  it("Check for bad email and bad password", async () => {
    const response5: any = await request(
      process.env.TEST_HOST as string,
      mutation("a", "a")
    );
    expect(response5).toEqual({
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
