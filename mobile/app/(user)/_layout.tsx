import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-car"
        options={{
          presentation: 'modal',
          title: 'Byt bil',
        }}
      />
    </Stack>
  );
}
