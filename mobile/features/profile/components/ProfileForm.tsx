import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { getProfile, updateProfile } from '../services/profileApi';

export type Profile = {
  name: string;
  email: string;
  avatarUrl?: string;
};

type Props = {
  onSave?: () => void;
};

export default function ProfileForm({ onSave }: Props) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getProfile();
        if (p) {
          setProfile({
            name: p.name || '',
            email: p.email || '',
            avatarUrl: p.avatarUrl || '',
          });
        }
      } catch (err) {
        console.log('Fel vid hämtning av profil:', err);
        Alert.alert('Fel', 'Kunde inte hämta profildata.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!profile.name.trim() || !profile.email.includes('@')) {
      Alert.alert('Fel', 'Ange ett giltigt namn och e-postadress.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profile);
      Alert.alert('Klart!', 'Profilen har uppdaterats.');
      if (onSave) onSave();
    } catch (err) {
      console.log('Fel vid uppdatering:', err);
      Alert.alert('Fel', 'Kunde inte uppdatera profilen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Namn"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="E-post"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Avatar URL"
        value={profile.avatarUrl}
        onChangeText={(text) => setProfile({ ...profile, avatarUrl: text })}
        style={styles.input}
      />
      <Button title="Spara profil" onPress={handleSave} disabled={saving} />
      {saving && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
