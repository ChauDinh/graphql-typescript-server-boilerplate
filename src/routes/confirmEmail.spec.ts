import fetch from "node-fetch";

describe("Test confirm email route", () => {
  it("Handle invalid if there is a bad id", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/1111`);
    const text = await response.text();
    expect(text).toEqual("invalid");
  });
});
