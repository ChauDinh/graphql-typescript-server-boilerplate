import * as Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";

import { User } from "./../entity/User";
import { createTypeORMConnection } from "./createTypeORMConnection";
import { createConfirmEmailLink } from "./createConfirmEmailLink";

let userId = "";
const redis = new Redis();

let connection: Connection;

beforeAll(async () => {
	connection = await createTypeORMConnection();

	const user = await User.create({
		email: "bob5@bob5.com",
		password: "abcde12345"
	}).save();

	userId = user.id;
});

afterAll(async () => {
	connection.close();
});

describe("Create confirm email link", () => {
	it("Make sure createConfirmEmailLink works and clear key in redis", async () => {
		const link = await createConfirmEmailLink(
			process.env.TEST_HOST as string,
			userId as string,
			redis
		);

		const response = await fetch(link);
		const text = await response.text();
		expect(text).toEqual("ok");

		const user = await User.findOne({ where: { id: userId } });
		expect((user as User).confirmed).toBeTruthy();

		const chunks = link.split("/");
		const key = chunks[chunks.length - 1];
		const value = await redis.get(key);
		expect(value).toBeNull();
	});

	it("Handle invalid if there is a bad id", async () => {
		const response = await fetch(
			`${process.env.TEST_HOST}/confirm/1111`
		);
		const text = await response.text();
		expect(text).toEqual("invalid");
	});
});
