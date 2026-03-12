import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider } from "@/theme/ThemeContext";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import "@/utils/axiosConfig";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/notificationService";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }) as Notifications.NotificationBehavior,
});

function RootNavigator() {
  const { themeName } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>

      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    async function getToken() {
      const token = await registerForPushNotificationsAsync();
      console.log("Push Token:", token);
    }

    getToken();
  }, []);

  useEffect(() => {
    // When notification is received while app is open
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Foreground notification:", notification);
      },
    );

    // When user taps notification (background or closed)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);

        const data = response.notification.request.content.data;

        // Example navigation
        if (data?.type === "order") {
          // You can use router.push here
          console.log("Navigate to order screen");
        }
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
