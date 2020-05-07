import * as SparkPost from "sparkpost";

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendConfirmEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true,
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email",
      html: `<html>
        <body>
          <p>Confirm email link: please click the link below to active your sign submission</p>
          <a href="${url}">click here to confirm email</a>
        </body>
      </html>`,
    },
    recipients: [{ address: recipient }],
  });
  console.log(response);
};
