import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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
  const [search, setSearch] = useState('');

  const filteredModels = useMemo(
    () =>
      models.filter((m) =>
        m.Model_Name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, models],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Välj modell</Text>
      <TextInput
        placeholder="Sök modell..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.Model_ID.toString()}
        style={{ maxHeight: 300 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              item.Model_Name === selected && styles.selectedItem,
            ]}
            onPress={() => onSelect(item.Model_Name)}
          >
            <Text
              style={[
                styles.itemText,
                item.Model_Name === selected && styles.selectedText,
              ]}
            >
              {item.Model_Name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedItem: { backgroundColor: '#2196f3' },
  itemText: { fontSize: 16 },
  selectedText: { color: '#fff', fontWeight: '700' },
});
