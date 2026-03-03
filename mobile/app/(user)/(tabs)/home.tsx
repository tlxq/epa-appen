import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/hooks/use-theme";

export default function UserHome() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwt");
    Alert.alert("Utloggad", "Du är nu utloggad");
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: fontSize.xl,
            fontWeight: fontWeight.extrabold,
          },
        ]}
      >
        Välkommen till User Dashboard!
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.error,
            borderRadius: radius.md,
            marginTop: spacing.md,
          },
        ]}
        onPress={handleLogout}
      >
        <Text style={{ color: "#fff", fontWeight: fontWeight.bold }}>
          Logga ut
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: { marginBottom: 20, textAlign: "center" },
  button: { paddingVertical: 12, paddingHorizontal: 24, alignItems: "center" },
});
