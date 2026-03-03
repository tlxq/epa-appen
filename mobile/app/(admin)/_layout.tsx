import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

export default function AdminLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="invite"
        options={{
          presentation: "modal",
          title: "Skicka invite",
        }}
      />
    </Stack>
  );
}
