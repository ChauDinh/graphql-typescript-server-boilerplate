import { createTestConnection } from "../../../testUtils/createTestConnection";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

import { notConfirmEmail, invalidLogin } from "./errorMessage";
import { User } from "../../../entity/User";
// import { createTestConnection } from "./../../jestGlobalSetup/createTestConnection";
import { Connection } from "typeorm";

faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.password();

const client = new TestClient(process.env.TEST_HOST as string);

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection();
});
afterAll(async () => {
  conn.close();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
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
    await loginExpectError(
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  test("email not confirmed", async () => {
    await client.register(email, password);

    await loginExpectError(email, password, notConfirmEmail);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, faker.internet.password(), invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: null,
    });
  });
});
