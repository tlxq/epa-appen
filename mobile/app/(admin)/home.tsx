import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert('Utloggad', 'Du är nu utloggad');
    router.replace('/(auth)/login');
  };

  const handleInvite = () => {
    router.push('/(admin)/invite');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Dashboard</Text>
      <Button title="Skicka Invite" onPress={handleInvite} />
      <Button title="Logga ut" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 20 },
});
