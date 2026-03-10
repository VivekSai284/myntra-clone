// app/services/notificationService.ts

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await axios.post("http://YOUR_BACKEND/api/notifications/register", {
    userId,
    token,
  });
}