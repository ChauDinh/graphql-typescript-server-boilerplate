import axios from "axios";
import { Connection } from "typeorm";
// import fetch from "node-fetch";

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

const meQuery = `
  {
    me {
      id
      email
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

const logoutMutation = `
  mutation {
    logout
  }
`;

describe("Test logout", () => {
  test("test logging out an account", async () => {
    //   STEP 1: login success and send cookie
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

    // STEP 2: logout success
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation,
      },
      {
        withCredentials: true,
      }
    );

    // STEP 3: check whether cookie (userId) exits in redis
    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      }
    );
    expect(response2.data.data.me).toBeNull();
  });
});
