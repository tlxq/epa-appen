import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  make?: string | null;
  model?: string | null;
};

export default function CarSummaryCard({ make, model }: Props) {
  const { colors, radius, fontSize, fontWeight } = useTheme();
  const carText = make || model ? `${make || ""} ${model || ""}`.trim() : null;

  if (!carText) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderRadius: radius.lg },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.textSecondary, fontWeight: fontWeight.bold },
        ]}
      >
        🚗 Din bil
      </Text>
      <Text style={[styles.car, { color: colors.text, fontSize: fontSize.lg }]}>
        {carText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 12,
  },
  title: { marginBottom: 4 },
  car: { fontWeight: "600" },
});
