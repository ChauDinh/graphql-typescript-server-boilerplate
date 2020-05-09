import { Connection } from "typeorm";
// import fetch from "node-fetch";
import axios from "axios";

import { User } from "./../../entity/User";
import { createTypeORMConnection } from "./../../utils/createTypeORMConnection";

const email = "bob1@bob1.com";
const password = "123abc";

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
  // test("return null with no cookie", async () => {
  //   const response = await axios.post(process.env.TEST_HOST as string, {
  //     query: meQuery,
  //   });
  //   expect(response.data.data.me).toBeNull();
  // });
  test("get current user", async () => {
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

    console.log(response.data.data);
    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
