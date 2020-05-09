import { request } from "graphql-request";

import { notConfirmEmail, invalidLogin } from "./errorMessage";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { Connection } from "typeorm";

const email = "bob1@bob1.com";
const password = "123abc";

const registerMutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
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

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
    login: [
      {
        path: "email",
        message: errMsg,
      },
    ],
  });
};

describe("Login user", () => {
  test("email not found send back error", async () => {
    await loginExpectError("bob@bob.com", "whatever123", invalidLogin);
  });

  test("email not confirmed", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );
    await loginExpectError(email, password, notConfirmEmail);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, "adfasdfasdfasdf233", invalidLogin);

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );
    expect(response).toEqual({
      login: null,
    });
  });
});
