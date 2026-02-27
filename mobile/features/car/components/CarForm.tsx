import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useCars } from '../hooks/useCars';
import CarMakeSelector from './CarMakeSelector';
import CarModelSelector from './CarModelSelector';
import { useCar } from '../hooks/CarContext';

export default function CarForm({ onSave }: { onSave?: () => void }) {
  const { makes, models, loadMakes, loadModels, loading } = useCars();
  const { updateCar } = useCar();

  const [selectedMake, setSelectedMake] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    loadMakes();
  }, [loadMakes]);

  const handleMakeSelect = async (make: any) => {
    setSelectedMake(make);
    setSelectedModel('');
    await loadModels(make.Make_ID);
  };

  const handleSave = async () => {
    if (!selectedMake || !selectedModel) return;

    const newCar = { make: selectedMake.Make_Name, model: selectedModel };
    await updateCar(newCar);

    if (onSave) onSave();
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator />}

      <CarMakeSelector
        makes={makes}
        selected={selectedMake}
        onSelect={handleMakeSelect}
      />

      {selectedMake && (
        <CarModelSelector
          models={models}
          selected={selectedModel}
          onSelect={setSelectedModel}
        />
      )}

      <Button title="Spara bil" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});
