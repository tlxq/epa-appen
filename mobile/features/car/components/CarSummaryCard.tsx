import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  make: string;
  model: string;
};

export default function CarSummaryCard({ make, model }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🚗 Din bil</Text>
      <Text style={styles.car}>
        {make} {model}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  car: {
    fontSize: 18,
  },
});
