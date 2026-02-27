import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert('Utloggad', 'Du är nu utloggad');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Välkommen till User Dashboard!</Text>
      <Button title="Logga ut" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 20 },
});
