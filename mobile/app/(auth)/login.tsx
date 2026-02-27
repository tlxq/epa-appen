import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ttdevs.com';
const backgroundImg = require('../../assets/images/epa1.webp');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Fel', data.error || 'Något gick fel');
        return;
      }
      await AsyncStorage.setItem('jwt', data.token);
      Alert.alert('Inloggad', `Välkommen ${data.user.username}`);
      if (data.user.role === 'admin') {
        router.replace('/(admin)/home');
      } else {
        router.replace('/(user)/home');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Fel', 'Kunde inte ansluta till servern');
    }
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Optional: add dark overlay for contrast */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Lösenord"
          placeholderTextColor="#ddd"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <Button title="Logga in" onPress={handleLogin} color="#fff" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,16,32,0.55)',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    padding: 10,
    marginBottom: 16,
    borderRadius: 5,
  },
});
