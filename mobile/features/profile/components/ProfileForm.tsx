import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchMe,
  updateMe,
  uploadAvatar,
  type ServerUser,
} from "../services/profileApi";
import { useCar } from "@/features/car/context/CarContext";
import { useTheme } from "@/hooks/use-theme";

type Props = { onSave?: (saved: ServerUser) => void };

export default function ProfileForm({ onSave }: Props) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const router = useRouter();
  const { car } = useCar();
  const bioRef = useRef<TextInput>(null);

  const [me, setMe] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchMe();
        setMe(user);
        setName(user.name || "");
        setBio(user.bio || "");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickAndUploadAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Behörighet krävs", "Ge appen tillgång till bilder.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (result.canceled) return;
      setUploadingAvatar(true);
      await uploadAvatar(result.assets[0].uri);
      const updated = await fetchMe();
      setMe(updated);
    } catch (e: any) {
      Alert.alert("Fel", e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    // Validate name length if provided
    if (name.trim().length === 1) {
      setError("Namn måste vara minst 2 tecken");
      return;
    }

    setSaving(true);
    try {
      // Only send name if user typed something (empty = keep existing)
      const payload: Parameters<typeof updateMe>[0] = {
        bio: bio.trim(),
      };
      if (name.trim().length >= 2) payload.name = name.trim();

      const updated = await updateMe(payload);
      setMe(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (onSave) onSave(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logga ut", "Är du säker på att du vill logga ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logga ut",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("jwt");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!me) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>Kunde inte ladda profil.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ─────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={pickAndUploadAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
              {me.avatar_url ? (
                <Image source={{ uri: me.avatar_url }} style={styles.avatar} />
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
                      fontSize: fontSize.xxxl,
                      fontWeight: fontWeight.extrabold,
                    }}
                  >
                    {(me.name?.trim() || me.username)?.[0]?.toUpperCase() ||
                      "?"}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Ionicons name="camera" size={14} color={colors.background} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              marginTop: spacing.md,
            }}
          >
            {me.name?.trim() || me.username}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            @{me.username}
          </Text>
        </View>

        {/* ── PROFIL ─────────────────────────────────── */}
        <SectionLabel text="PROFIL" colors={colors} fontSize={fontSize} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radius.lg },
          ]}
        >
          <FieldRow
            label="Namn"
            colors={colors}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ditt namn"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                { color: colors.text, fontSize: fontSize.md },
              ]}
              returnKeyType="next"
              onSubmitEditing={() => bioRef.current?.focus()}
              blurOnSubmit={false}
            />
          </FieldRow>

          <View style={[styles.sep, { backgroundColor: colors.borderLight }]} />

          <FieldRow
            label="Bio"
            colors={colors}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
            alignTop
          >
            <TextInput
              ref={bioRef}
              value={bio}
              onChangeText={(t) => {
                if (t.length <= 280) setBio(t);
              }}
              placeholder="Skriv något om dig..."
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                styles.bioInput,
                { color: colors.text, fontSize: fontSize.md },
              ]}
              multiline
              returnKeyType="done"
            />
            <Text
              style={{
                color: bio.length >= 260 ? colors.error : colors.textMuted,
                fontSize: fontSize.xs,
                marginTop: 4,
                textAlign: "right",
              }}
            >
              {bio.length}/280
            </Text>
          </FieldRow>
        </View>

        {/* ── BIL ────────────────────────────────────── */}
        <SectionLabel text="BIL" colors={colors} fontSize={fontSize} />
        <TouchableOpacity
          style={[
            styles.card,
            styles.rowCard,
            { backgroundColor: colors.surface, borderRadius: radius.lg },
          ]}
          onPress={() => router.push("../edit-car")}
          activeOpacity={0.7}
        >
          <Ionicons name="car-sport-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text
              style={{
                color:
                  car?.make || car?.model ? colors.text : colors.textMuted,
                fontSize: fontSize.md,
                fontWeight: fontWeight.medium,
              }}
            >
              {car?.make && car?.model
                ? `${car.make} ${car.model}`
                : car?.make || car?.model || "Lägg till din EPA-bil"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* ── KONTO ──────────────────────────────────── */}
        <SectionLabel text="KONTO" colors={colors} fontSize={fontSize} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radius.lg },
          ]}
        >
          <ReadRow
            label="Mejl"
            value={me.email}
            colors={colors}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
          />
          <View style={[styles.sep, { backgroundColor: colors.borderLight }]} />
          <ReadRow
            label="Användarnamn"
            value={`@${me.username}`}
            colors={colors}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
          />
          {me.created_at ? (
            <>
              <View
                style={[styles.sep, { backgroundColor: colors.borderLight }]}
              />
              <ReadRow
                label="Medlem sedan"
                value={new Date(me.created_at).toLocaleDateString("sv-SE", {
                  year: "numeric",
                  month: "long",
                })}
                colors={colors}
                fontSize={fontSize}
                fontWeight={fontWeight}
                spacing={spacing}
              />
            </>
          ) : null}
        </View>

        {/* ── Error ──────────────────────────────────── */}
        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: fontSize.sm,
              textAlign: "center",
              marginTop: spacing.md,
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* ── Save ───────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: saved ? colors.surfaceElevated : colors.primary,
              borderRadius: radius.md,
              marginTop: spacing.lg,
            },
            saving && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={saving || saved}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text
              style={{
                color: saved ? colors.primary : colors.background,
                fontWeight: fontWeight.bold,
                fontSize: fontSize.md,
              }}
            >
              {saved ? "✓  Sparat" : "Spara profil"}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Logout ─────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.rowCard,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              marginTop: spacing.xl,
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text
            style={{
              color: colors.error,
              fontSize: fontSize.md,
              fontWeight: fontWeight.semibold,
              marginLeft: spacing.md,
            }}
          >
            Logga ut
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ text, colors, fontSize }: any) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: fontSize.xs,
        fontWeight: "600",
        letterSpacing: 1.2,
        marginTop: 20,
        marginBottom: 8,
        marginHorizontal: 4,
      }}
    >
      {text}
    </Text>
  );
}

function FieldRow({
  label,
  children,
  colors,
  fontSize,
  fontWeight,
  spacing,
  alignTop = false,
}: any) {
  return (
    <View
      style={[
        styles.fieldRow,
        { padding: spacing.md, alignItems: alignTop ? "flex-start" : "center" },
      ]}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: fontSize.sm,
          fontWeight: fontWeight.medium,
          width: 80,
          paddingTop: alignTop ? 2 : 0,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function ReadRow({ label, value, colors, fontSize, fontWeight, spacing }: any) {
  return (
    <View
      style={[styles.fieldRow, { padding: spacing.md, alignItems: "center" }]}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: fontSize.sm,
          fontWeight: fontWeight.medium,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: fontSize.sm,
          textAlign: "right",
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  avatarSection: { alignItems: "center", paddingTop: 8, paddingBottom: 4 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  card: { overflow: "hidden" },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  sep: { height: 1, marginHorizontal: 16 },
  fieldRow: { flexDirection: "row" },
  fieldInput: { flex: 1, padding: 0 },
  bioInput: { minHeight: 56, textAlignVertical: "top" },

  saveBtn: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
});
