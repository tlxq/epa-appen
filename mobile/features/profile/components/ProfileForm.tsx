import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';

import {
  fetchMe,
  updateMe,
  type ServerUser,
} from '../services/profileServerApi';

type Props = {
  onSave?: () => void;
};

export default function ProfileForm({ onSave }: Props) {
  const [me, setMe] = useState<ServerUser | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchMe();
        setMe(user);
        setName(user.name || '');
      } catch (err: any) {
        console.log('Fel vid hämtning av profil:', err);
        Alert.alert('Fel', err.message || 'Kunde inte hämta profildata.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Fel', 'Ange ett giltigt namn (minst 2 tecken).');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMe({ name: name.trim() });
      setMe(updated);
      Alert.alert('Klart!', 'Profilen har uppdaterats.');
      if (onSave) onSave();
    } catch (err: any) {
      console.log('Fel vid uppdatering:', err);
      Alert.alert('Fel', err.message || 'Kunde inte uppdatera profilen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  if (!me) {
    return (
      <View style={styles.container}>
        <Text>Kunde inte ladda profilen.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>E-post (går ej att ändra)</Text>
      <TextInput
        value={me.email}
        editable={false}
        style={[styles.input, styles.disabled]}
      />

      <Text style={styles.label}>Namn</Text>
      <TextInput
        placeholder="Ditt namn"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button
        title={saving ? 'Sparar...' : 'Spara profil'}
        onPress={handleSave}
        disabled={saving}
      />
      {saving && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  disabled: { opacity: 0.7 },
});
