import { request } from "graphql-request";
import { AddressInfo } from "net";

import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "./errorMessage";

/**
 * TODO:
 *
 * use a test database
 * drop all data once the test is over
 * when I run yarn test it also starts the server
 */

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

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

test("Register user", async () => {
  // make sure we can register new user
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // try to sign up again with the same account, duplicated email
  const response2: any = await request(getHost(), mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0]).toEqual({
    path: "email",
    message: "already taken",
  });

  // catch bad email
  const response3: any = await request(getHost(), mutation("b", password));
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

  // catch bad password
  const response4: any = await request(getHost(), mutation(email, "a"));
  expect(response4).toEqual({
    register: [
      {
        path: "password",
        message: passwordNotLongEnough,
      },
    ],
  });

  // catch for both bad email and bad password
  const response5: any = await request(getHost(), mutation("a", "a"));
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
