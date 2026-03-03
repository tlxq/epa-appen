import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { LocationSharingProvider } from "@/features/location/LocationContext";

export default function UserLayout() {
  const { colors } = useTheme();
  return (
    <LocationSharingProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="edit-profile"
          options={{
            presentation: "modal",
            title: "Inställningar",
          }}
        />

        <Stack.Screen
          name="edit-car"
          options={{
            presentation: "modal",
            title: "Byt bil",
          }}
        />

        <Stack.Screen
          name="chat/[userId]"
          options={{ title: "" }}
        />
      </Stack>
    </LocationSharingProvider>
  );
}
