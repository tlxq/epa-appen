import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCars } from "../hooks/useCars";
import CarMakeSelector from "./CarMakeSelector";
import CarModelSelector from "./CarModelSelector";
import { useCar } from "../context/CarContext";
import { useTheme } from "@/hooks/use-theme";

export default function CarForm({ onSave }: { onSave?: () => void }) {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const { makes, models, loadMakes, loadModels, loading } = useCars();
  const { car, updateCar } = useCar();

  const [selectedMake, setSelectedMake] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMakes();
  }, [loadMakes]);

  const handleMakeSelect = async (make: any) => {
    setSelectedMake(make);
    setSelectedModel("");
    await loadModels(make.Make_ID);
  };

  const handleSave = async () => {
    if (!selectedMake || !selectedModel) return;
    setSaving(true);
    try {
      await updateCar({ make: selectedMake.Make_Name, model: selectedModel });
      if (onSave) onSave();
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!selectedMake && !!selectedModel;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current car banner */}
        {car?.make && (
          <View
            style={[
              styles.currentCar,
              { backgroundColor: colors.surface, borderRadius: radius.lg },
            ]}
          >
            <Ionicons
              name="car-sport-outline"
              size={18}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: fontSize.sm,
                marginLeft: spacing.sm,
              }}
            >
              Nuvarande:{" "}
              <Text
                style={{ color: colors.text, fontWeight: fontWeight.semibold }}
              >
                {car.make} {car.model}
              </Text>
            </Text>
          </View>
        )}

        {/* Section label */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.xs,
            fontWeight: fontWeight.semibold,
            letterSpacing: 1.2,
            marginBottom: spacing.sm,
          }}
        >
          VÄLJ MÄRKE
        </Text>

        {loading && !makes.length ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSize.sm,
                marginLeft: spacing.sm,
              }}
            >
              Hämtar bilmärken...
            </Text>
          </View>
        ) : (
          <CarMakeSelector
            makes={makes}
            selected={selectedMake}
            onSelect={handleMakeSelect}
          />
        )}

        {selectedMake && (
          <>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: fontSize.sm,
                    marginLeft: spacing.sm,
                  }}
                >
                  Hämtar modeller...
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    letterSpacing: 1.2,
                    marginBottom: spacing.sm,
                  }}
                >
                  VÄLJ MODELL
                </Text>
                <CarModelSelector
                  models={models}
                  selected={selectedModel}
                  onSelect={setSelectedModel}
                />
              </>
            )}
          </>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: canSave
                ? colors.primary
                : colors.surfaceElevated,
              borderRadius: radius.md,
              opacity: saving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text
              style={{
                color: canSave ? colors.background : colors.textMuted,
                fontWeight: fontWeight.bold,
                fontSize: fontSize.md,
              }}
            >
              {canSave ? "Spara bil" : "Välj märke och modell"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  currentCar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  button: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 8,
  },
});
