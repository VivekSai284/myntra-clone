import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import axios from "axios";

export async function registerForPushNotifications(userId: string) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Permission not granted!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    console.log("Expo Push Token:", token);

    // SEND TOKEN TO BACKEND
    await axios.post("https://myntra-clone-j4a9.onrender.com/api/notifications/register", {
      userId: userId,
      token: token,
      platform: Platform.OS
    });

  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}