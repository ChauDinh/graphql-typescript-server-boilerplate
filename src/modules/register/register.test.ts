import { request } from "graphql-request";
import { AddressInfo } from "net";

import { User } from "../../entity/User";
import { startServer } from "../../startServer";

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

const email = "bob1@bob.com";
const password = "123abc";

const mutation = `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // try to sign up again with the same account
  const response2: any = await request(getHost(), mutation);
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual("email");
});
