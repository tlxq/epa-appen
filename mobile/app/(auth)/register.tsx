import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!token) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          style={{
            color: colors.error,
            textAlign: "center",
            marginBottom: spacing.lg,
            fontSize: fontSize.lg,
          }}
        >
          Ingen inbjudan/token i länken!
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderRadius: radius.md },
          ]}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ color: colors.text, fontWeight: fontWeight.semibold }}>
            Tillbaka till login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Fel", data.error || "Något gick fel");
        return;
      }

      Alert.alert("Registrerad", `Välkommen ${data.user.username}`);
      router.replace("/(auth)/login");
    } catch (err) {
      console.error(err);
      Alert.alert("Fel", "Kunde inte ansluta till servern");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            marginBottom: spacing.lg,
          },
        ]}
      >
        Skapa konto
      </Text>
      <TextInput
        placeholder="Användarnamn"
        placeholderTextColor={colors.placeholder}
        value={username}
        onChangeText={setUsername}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderRadius: radius.md,
            marginBottom: spacing.md,
          },
        ]}
      />
      <TextInput
        placeholder="Lösenord"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderRadius: radius.md,
            marginBottom: spacing.lg,
          },
        ]}
        secureTextEntry
      />
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary, borderRadius: radius.md },
        ]}
        onPress={handleRegister}
      >
        <Text
          style={{
            color: colors.background,
            fontWeight: fontWeight.bold,
            fontSize: fontSize.md,
          }}
        >
          Registrera
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { textAlign: "center" },
  input: {
    borderWidth: 1,
    padding: 12,
  },
  button: { paddingVertical: 14, alignItems: "center" },
});
