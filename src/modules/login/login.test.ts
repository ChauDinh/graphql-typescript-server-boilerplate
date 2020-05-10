import { TestClient } from "./../../utils/TestClient";

import { notConfirmEmail, invalidLogin } from "./errorMessage";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { Connection } from "typeorm";

const email = "bob1@bob1.com";
const password = "123abc";

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeORMConnection();
});
afterAll(async () => {
  conn.close();
});

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
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
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, "bob@bob.com", "whatever123", invalidLogin);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginExpectError(client, email, password, notConfirmEmail);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "adfasdfasdfasdf233", invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: null,
    });
  });
});
