import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    alert("Must use physical device");
    return;
  }

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

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  console.log("Expo Push Token:", token);

  // 🔥 Send token to backend
  await axios.post("http://10.125.247.12/api/notifications/register", {
    userId,
    token,
    platform: "android",
  });

  console.log("Token sent to backend");
}