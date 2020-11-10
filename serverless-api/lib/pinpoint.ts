import * as Pinpoint from "aws-sdk/clients/pinpoint";

const pinpoint = new Pinpoint({ region: "us-west-2" });

const ApplicationId = "3a0e91031ee043a4b8f3ae4020b1516a";

export interface SendNotificationToUserParams {
  userId: string;
  simpleNotification?: {
    title: string;
    message: string;
  };
  params?: Pinpoint.DirectMessageConfiguration;
}
export async function sendNotificationToUser({
  userId,
  simpleNotification,
  params: argParams,
}: SendNotificationToUserParams) {
  const params: Pinpoint.DirectMessageConfiguration = !!simpleNotification
    ? {
        DefaultPushNotificationMessage: {
          Title: simpleNotification.title,
          Body: simpleNotification.message,
        },
      }
    : argParams;
  const result = await pinpoint
    .sendUsersMessages({
      ApplicationId,
      SendUsersMessageRequest: {
        MessageConfiguration: params,
        Users: {
          [userId]: {},
        },
      },
    })
    .promise();

  return result;
}

sendNotificationToUser({
  userId: "ap-southeast-2:b8b82fb3-25d4-46b6-b385-97466fdfd0af",
  simpleNotification: {
    title: "Testing 123",
    message: "test message",
  },
}).then(result => console.log({ result }));
