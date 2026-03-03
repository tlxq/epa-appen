import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useProfile } from "../../../features/profile/hooks/useProfile";
import ProfileCard from "../../../features/profile/components/ProfileCard";
import { useTheme } from "@/hooks/use-theme";

export default function ProfileTab() {
  const router = useRouter();
  const navigation = useNavigation();
  const { profile, loading, error, reload } = useProfile();
  const { colors } = useTheme();

  // Reload whenever the tab comes into focus (e.g. after editing)
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  React.useLayoutEffect(() => {
    if (error) {
      Alert.alert("Fel", error);
      router.replace("/(auth)/login");
    }
  }, [error, router]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push("../edit-profile")}
          style={{ paddingHorizontal: 14 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-outline" size={22} color={colors.icon} />
        </TouchableOpacity>
      ),
      title: "Profil",
    });
  }, [navigation, colors, router]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>
          Kunde inte ladda profilen.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={reload}
          tintColor={colors.primary}
        />
      }
    >
      <ProfileCard user={profile} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flexGrow: 1 },
});
