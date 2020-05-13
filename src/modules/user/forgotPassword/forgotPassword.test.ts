// import { createTypeORMConnection } from "./../../utils/createTypeORMConnection";
import { Connection } from "typeorm";
import * as Redis from "ioredis";
import * as faker from "faker";

// import { createTestConnection } from "./../../jestGlobalSetup/createTestConnection";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { passwordNotLongEnough } from "../register/errorMessage";
import { forgotPasswordLockedError } from "../login/errorMessage";
import { TestClient } from "../../../utils/TestClient";
import { expiredKeyError } from "./errorMessage";
import { User } from "../../../entity/User";
import { createTestConnection } from "../../../testUtils/createTestConnection";

let conn: Connection;
export const redis = new Redis();
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = faker.internet.password();
let userId: string;

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

describe("Test forgot password", () => {
  test("the logic for forgot password works", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // STEP 1: lock account
    await forgotPasswordLockAccount(userId, redis);
    const link = await createForgotPasswordLink("", userId, redis);

    const parts = link.split("/");
    const key = parts[parts.length - 1];

    // STEP 2: make sure you can't login with locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: forgotPasswordLockedError,
          },
        ],
      },
    });

    //  STEP 3: try changing the too short password
    expect(await client.forgotPasswordChange("a", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLongEnough,
          },
        ],
      },
    });

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null,
    });

    //  STEP 4: make sure the redis key expires after password changed
    expect(
      await client.forgotPasswordChange(faker.internet.password(), key)
    ).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredKeyError,
          },
        ],
      },
    });
    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null,
      },
    });
  });
});
