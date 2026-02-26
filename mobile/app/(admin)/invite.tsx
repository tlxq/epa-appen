import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InviteScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert('Utloggad', 'Du är nu utloggad');
    router.replace('/(auth)/login');
  };

  const handleInvite = async () => {
    if (!email) {
      Alert.alert('Fel', 'Ange en email');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      const res = await fetch('http://192.168.50.22:5001/api/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, // if your API uses auth
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Fel', data.error || 'Misslyckades att skicka invite');
        setLoading(false);
        return;
      }
      Alert.alert(
        'Invite skickad',
        `Inbjudan skickad till ${email}!\nLänk: ${data.link || ''}`,
      );
      setEmail('');
    } catch (err) {
      console.error(err);
      Alert.alert('Fel', 'Kunde inte skicka invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hantera inbjudningar</Text>
      <TextInput
        placeholder="Användarens email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        editable={!loading}
        autoCapitalize="none"
      />
      <Button
        title={loading ? 'Skickar...' : 'Skicka Invite'}
        onPress={handleInvite}
        disabled={loading}
      />
      <View style={{ height: 16 }} />
      <Button title="Logga ut" color="tomato" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: { fontSize: 24, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    minWidth: 220,
    textAlign: 'center',
  },
});
