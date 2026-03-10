const { Expo } = require("expo-server-sdk");
const DeviceToken = require("../models/deviceToken");

const expo = new Expo();

async function sendPush(userId, title, body, data = {}) {
  const tokens = await DeviceToken.find({ user: userId });

  const messages = tokens.map(t => ({
    to: t.token,
    sound: "default",
    title,
    body,
    data,
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    const tickets = await expo.sendPushNotificationsAsync(chunk);

    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].status === "error") {
        await DeviceToken.deleteOne({ token: messages[i].to });
      }
    }
  }
}

module.exports = sendPush;