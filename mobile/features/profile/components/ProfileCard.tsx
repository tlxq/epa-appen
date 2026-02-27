import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type Props = {
  name: string;
  email: string;
  avatarUrl?: string;
  car?: string;
};

export default function ProfileCard({ name, email, avatarUrl, car }: Props) {
  return (
    <View style={styles.card}>
      {avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      {car && <Text style={styles.car}>🚗 {car}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  car: {
    fontSize: 16,
    marginTop: 8,
  },
});
