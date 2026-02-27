import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ttdevs.com';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!token) {
    return (
      <View style={styles.container}>
        <Text
          style={{
            color: 'red',
            textAlign: 'center',
            marginBottom: 24,
            fontSize: 18,
          }}
        >
          Ingen inbjudan/token i länken!
        </Text>
        <Button
          title="Tillbaka till login"
          onPress={() => router.replace('/(auth)/login')}
        />
      </View>
    );
  }

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Fel', data.error || 'Något gick fel');
        return;
      }

      Alert.alert('Registrerad', `Välkommen ${data.user.username}`);
      router.replace('/(auth)/login');
    } catch (err) {
      console.error(err);
      Alert.alert('Fel', 'Kunde inte ansluta till servern');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Användarnamn"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Registrera" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
