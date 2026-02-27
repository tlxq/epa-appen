import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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
  const [search, setSearch] = useState('');

  const filteredMakes = useMemo(() => {
    if (!search) return makes;
    return makes.filter((m) =>
      m.Make_Name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [makes, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Sök bilmärke..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredMakes}
        keyExtractor={(item) => item.Make_ID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selected?.Make_ID === item.Make_ID && styles.selected,
            ]}
            onPress={() => onSelect(item)}
          >
            <Text>{item.Make_Name}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, maxHeight: 250 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  list: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6 },
  item: { padding: 10 },
  selected: { backgroundColor: '#d0e8ff' },
});
