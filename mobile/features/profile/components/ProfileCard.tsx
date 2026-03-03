import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ServerUser } from "../services/profileApi";
import { useTheme } from "@/hooks/use-theme";

type Props = { user: ServerUser };

export default function ProfileCard({ user }: Props) {
  const { colors, radius, fontSize, fontWeight, spacing } = useTheme();
  const displayName = user.name?.trim() || user.username;
  const carText =
    user.car_make || user.car_model
      ? `${user.car_make || ""} ${user.car_model || ""}`.trim()
      : null;
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View
        style={[
          styles.avatarRing,
          { borderColor: colors.primary, backgroundColor: colors.surface },
        ]}
      >
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: fontSize.xxl,
                fontWeight: fontWeight.extrabold,
              }}
            >
              {displayName?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        style={{
          color: colors.text,
          fontSize: fontSize.xl,
          fontWeight: fontWeight.extrabold,
          marginTop: spacing.md,
        }}
      >
        {displayName}
      </Text>

      {/* @username if they have a display name */}
      {user.name?.trim() ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.sm,
            marginTop: 2,
          }}
        >
          @{user.username}
        </Text>
      ) : null}

      {/* Role badge */}
      <View
        style={[
          styles.badge,
          { backgroundColor: colors.primary, borderRadius: radius.full },
        ]}
      >
        <Text
          style={{
            color: colors.background,
            fontSize: fontSize.xs,
            fontWeight: fontWeight.bold,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {user.role}
        </Text>
      </View>

      {/* Bio */}
      {user.bio ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: fontSize.sm,
            marginTop: spacing.md,
            textAlign: "center",
            lineHeight: 20,
            paddingHorizontal: spacing.md,
          }}
        >
          {user.bio}
        </Text>
      ) : null}

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      {/* Info rows */}
      <View style={styles.infoList}>
        <InfoRow
          icon="car-sport-outline"
          label={carText ?? "Ingen bil registrerad"}
          muted={!carText}
          colors={colors}
          fontSize={fontSize}
          fontWeight={fontWeight}
          spacing={spacing}
        />
        {joinedDate ? (
          <InfoRow
            icon="calendar-outline"
            label={`Medlem sedan ${joinedDate}`}
            muted
            colors={colors}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
          />
        ) : null}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  muted,
  colors,
  fontSize,
  fontWeight,
  spacing,
}: any) {
  return (
    <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
      <Ionicons
        name={icon}
        size={16}
        color={muted ? colors.textMuted : colors.primary}
      />
      <Text
        style={{
          color: muted ? colors.textMuted : colors.text,
          fontSize: fontSize.sm,
          fontWeight: fontWeight.medium,
          marginLeft: spacing.sm,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarRing: { borderWidth: 3, borderRadius: 60, overflow: "hidden" },
  avatar: { width: 110, height: 110 },
  avatarFallback: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 4 },
  divider: { width: "100%", height: 1, marginVertical: 20 },
  infoList: { width: "100%" },
  infoRow: { flexDirection: "row", alignItems: "center" },
});
