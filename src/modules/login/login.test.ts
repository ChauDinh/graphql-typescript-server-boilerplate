import { request } from "graphql-request";

// const email = "bob1@bob1.com";
// const password = "123abc";

// const registerMutation = (e: string, p: string) => `
// mutation {
// register(email: "${e}", password: "${p}") {
// path
// message
// }
// }
// `;

const loginMutation = (e: string, p: string) => `
	mutation {
		login(email: "${e}", password: "${p}") {
			path
			message
		}
	}
`;

describe("Login user", () => {
  it("test invalid login", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation("bob@bob.com", "whatever123")
    );

    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: "invalid login",
        },
      ],
    });
  });
});
