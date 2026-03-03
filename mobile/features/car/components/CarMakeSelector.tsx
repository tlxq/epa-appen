import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";

interface CarMakeSelectorProps {
  makes: any[];
  selected: any | null;
  onSelect: (make: any) => void;
}

export default function CarMakeSelector({
  makes,
  selected,
  onSelect,
}: CarMakeSelectorProps) {
  const { colors, radius, fontSize, fontWeight } = useTheme();
  const [search, setSearch] = useState("");

  const filteredMakes = useMemo(() => {
    if (!search.trim()) return [];
    return makes
      .filter((m) => m.Make_Name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [makes, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            fontSize: fontSize.md,
          },
        ]}
        placeholder="Sök bilmärke..."
        placeholderTextColor={colors.placeholder}
        value={search}
        onChangeText={setSearch}
      />
      {!search.trim() ? (
        <View
          style={[
            styles.emptyState,
            { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
          ]}
        >
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            Skriv för att söka bland bilmärken...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={[
            styles.list,
            { borderColor: colors.border, borderRadius: radius.md },
          ]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {filteredMakes.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                Inga träffar för "{search}"
              </Text>
            </View>
          ) : (
            filteredMakes.map((item) => {
              const isSelected = selected?.Make_ID === item.Make_ID;
              return (
                <TouchableOpacity
                  key={item.Make_ID.toString()}
                  style={[
                    styles.item,
                    {
                      borderBottomColor: isSelected
                        ? "transparent"
                        : colors.borderLight,
                      backgroundColor: isSelected ? colors.primary : "transparent",
                    },
                  ]}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.background : colors.text,
                      fontSize: fontSize.sm,
                      fontWeight: isSelected ? fontWeight.bold : fontWeight.regular,
                    }}
                  >
                    {item.Make_Name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 6,
  },
  list: { borderWidth: 1, maxHeight: 220 },
  item: { padding: 12, borderBottomWidth: 1 },
  emptyState: {
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
});
