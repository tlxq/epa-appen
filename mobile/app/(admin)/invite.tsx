import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/hooks/use-theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";

export default function InviteScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwt");
    Alert.alert("Utloggad", "Du är nu utloggad");
    router.replace("/(auth)/login");
  };

  const handleInvite = async () => {
    if (!email) {
      Alert.alert("Fel", "Ange en email");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch(`${API_URL}/api/auth/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Fel", data.error || "Misslyckades att skicka invite");
        setLoading(false);
        return;
      }
      Alert.alert(
        "Invite skickad",
        `Inbjudan skickad till ${email}!\nLänk: ${data.inviteLink || ""}`,
      );
      setEmail("");
    } catch (err) {
      console.error(err);
      Alert.alert("Fel", "Kunde inte skicka invite");
    } finally {
      setLoading(false);
    }
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
        Hantera inbjudningar
      </Text>
      <TextInput
        placeholder="Användarens email"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        editable={!loading}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.md,
            marginBottom: spacing.sm,
            opacity: loading ? 0.6 : 1,
          },
        ]}
        onPress={handleInvite}
        disabled={loading}
      >
        <Text style={{ color: colors.background, fontWeight: fontWeight.bold }}>
          {loading ? "Skickar..." : "Skicka Invite"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.error, borderRadius: radius.md },
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
  input: {
    borderWidth: 1,
    padding: 12,
    minWidth: 280,
    textAlign: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 180,
  },
});
