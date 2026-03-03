import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/use-theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";
const backgroundImg = require("../../assets/images/epa1.webp");

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Fel", data.error || "Något gick fel");
        return;
      }
      await AsyncStorage.setItem("jwt", data.token);
      if (data.user.role === "admin") {
        router.replace("/(admin)/home");
      } else {
        router.replace("/(user)/(tabs)/home");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Fel", "Kunde inte ansluta till servern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.kavContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Brand */}
              <View style={styles.brand}>
                <Text
                  style={{
                    fontSize: fontSize.xxxl,
                    fontWeight: fontWeight.extrabold,
                    color: colors.primary,
                    letterSpacing: 2,
                  }}
                >
                  EPA
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    letterSpacing: 4,
                    marginTop: 4,
                  }}
                >
                  APPEN
                </Text>
              </View>

              {/* Card */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius.xl,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold,
                    color: colors.text,
                    marginBottom: spacing.lg,
                  }}
                >
                  Logga in
                </Text>

                <TextInput
                  placeholder="Email"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderRadius: radius.md,
                      marginBottom: spacing.md,
                      fontSize: fontSize.md,
                    },
                  ]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!loading}
                />

                <TextInput
                  ref={passwordRef}
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
                      fontSize: fontSize.md,
                    },
                  ]}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.md,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text
                      style={{
                        color: colors.background,
                        fontWeight: fontWeight.bold,
                        fontSize: fontSize.md,
                      }}
                    >
                      Logga in
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,8,20,0.72)",
  },
  kavContainer: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
  },
  brand: {
    alignItems: "center",
    marginBottom: 40,
  },
  card: {
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
  },
  button: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
});
