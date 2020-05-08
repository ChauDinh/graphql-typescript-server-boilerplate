import { Connection } from "typeorm";
import axios from "axios";

import { User } from "./../../entity/User";
import { createTypeORMConnection } from "./../../utils/createTypeORMConnection";

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

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const meQuery = `
  {
    me {
      id
      email
    }
  }
`;

describe("Test middleware", () => {
  // it("can't get user if not login", async () => {});
  it("get current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password),
      },
      {
        withCredentials: true,
      }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
