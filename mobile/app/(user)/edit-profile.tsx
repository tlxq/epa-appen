import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import {
  fetchMe,
  updateMe,
  uploadAvatar,
  type ServerUser,
} from '../../features/profile/services/profileServerApi';

export default function EditProfileScreen() {
  const router = useRouter();

  const [me, setMe] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const user = await fetchMe();
      setMe(user);
      setName(user.name || '');
      setBio(user.bio || '');
      setCarMake(user.car_make || '');
      setCarModel(user.car_model || '');
    } catch (e: any) {
      Alert.alert('Fel', e.message);
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pickAndUploadAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Behörighet krävs', 'Ge appen tillgång till Bilder.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled) return;

      setUploadingAvatar(true);
      await uploadAvatar(result.assets[0].uri);
      await load();
      Alert.alert('Klart', 'Profilbild uppdaterad.');
    } catch (e: any) {
      Alert.alert('Fel', e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);

      await updateMe({
        name: name.trim(),
        bio: bio.trim(),
        car_make: carMake.trim(),
        car_model: carModel.trim(),
      });

      Alert.alert('Sparat', 'Din profil är uppdaterad.');

      // Viktigt: trigga refresh på profilsidan när vi lämnar modalen
      router.replace({
        pathname: '/(user)/(tabs)/profile',
        params: { refresh: String(Date.now()) },
      });
    } catch (e: any) {
      Alert.alert('Fel', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!me) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilinställningar</Text>

      <View style={styles.avatarRow}>
        {me.avatar_url ? (
          <Image source={{ uri: me.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(me.name?.trim() || me.username)?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.avatarButton, { opacity: uploadingAvatar ? 0.6 : 1 }]}
          onPress={pickAndUploadAvatar}
          disabled={uploadingAvatar}
        >
          <Text style={styles.avatarButtonText}>
            {uploadingAvatar ? 'Laddar upp...' : 'Byt profilbild'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Mejladress</Text>
      <TextInput
        value={me.email}
        editable={false}
        style={[styles.input, styles.disabled]}
      />

      <Text style={styles.label}>Namn</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        style={[styles.input, styles.textArea]}
        multiline
        maxLength={280}
        placeholder="Skriv något om dig..."
      />
      <Text style={styles.counter}>{bio.length}/280</Text>

      <Text style={styles.label}>Bil</Text>
      <View style={styles.carRow}>
        <TextInput
          value={carMake}
          onChangeText={setCarMake}
          style={[styles.input, styles.carInput]}
          placeholder="Märke"
        />
        <TextInput
          value={carModel}
          onChangeText={setCarModel}
          style={[styles.input, styles.carInput]}
          placeholder="Modell"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { opacity: saving ? 0.6 : 1 }]}
        onPress={save}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Sparar...' : 'Spara'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  avatarButton: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  avatarButtonText: { color: '#fff', fontWeight: '700' },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '700' },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
  },
  disabled: { opacity: 0.7 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  counter: { marginTop: 6, fontSize: 12, color: '#666' },
  carRow: { flexDirection: 'row', gap: 10 },
  carInput: { flex: 1 },
  saveButton: {
    marginTop: 18,
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
