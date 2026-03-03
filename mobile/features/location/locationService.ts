import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LOCATION_TASK = "epa-background-location";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";

// Called by TaskManager in the background
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return;
  const [location] = data.locations;
  try {
    const jwt = await AsyncStorage.getItem("jwt");
    if (!jwt) return;
    await fetch(`${API_URL}/api/users/me/location`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }),
    });
  } catch {
    // silent — background tasks must not throw
  }
});

export async function postCurrentLocation(): Promise<void> {
  try {
    const jwt = await AsyncStorage.getItem("jwt");
    if (!jwt) return;
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await fetch(`${API_URL}/api/users/me/location`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      }),
    });
  } catch {
    // silent
  }
}

export async function startLocationSharing(): Promise<void> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== "granted") throw new Error("Platstillstånd nekades");

  // Post current location immediately so user appears on map right away
  await postCurrentLocation();

  // Try background task — silently skip if unavailable (Expo Go)
  try {
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg === "granted") {
      const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
      if (!isRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30_000,
          distanceInterval: 50,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "EPA Appen",
            notificationBody: "Delar din position med andra EPA-förare",
            notificationColor: "#F5C518",
          },
        });
      }
    }
  } catch {
    // Background not available (Expo Go) — foreground-only sharing still works
  }
}

export async function stopLocationSharing(): Promise<void> {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK).catch(() => {});
  }
}
