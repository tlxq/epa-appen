import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";

type Model = { Model_ID: number; Model_Name: string };

export default function CarModelSelector({
  models,
  selected,
  onSelect,
}: {
  models: Model[];
  selected: string;
  onSelect: (model: string) => void;
}) {
  const { colors, radius, fontSize, fontWeight } = useTheme();
  const [search, setSearch] = useState("");

  const filteredModels = useMemo(
    () =>
      models.filter((m) =>
        m.Model_Name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, models],
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Sök modell..."
        placeholderTextColor={colors.placeholder}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.searchInput,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            fontSize: fontSize.md,
          },
        ]}
      />
      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.Model_ID.toString()}
        style={[
          styles.list,
          { borderColor: colors.border, borderRadius: radius.md },
        ]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isSelected = item.Model_Name === selected;
          return (
            <TouchableOpacity
              style={[
                styles.item,
                {
                  borderBottomColor: isSelected
                    ? "transparent"
                    : colors.borderLight,
                  backgroundColor: isSelected ? colors.primary : "transparent",
                },
              ]}
              onPress={() => onSelect(item.Model_Name)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: isSelected ? colors.background : colors.text,
                  fontWeight: isSelected ? fontWeight.bold : fontWeight.regular,
                }}
              >
                {item.Model_Name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 6,
  },
  list: { borderWidth: 1, maxHeight: 240 },
  item: { padding: 12, borderBottomWidth: 1 },
});
