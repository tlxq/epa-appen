import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useCar } from '../../../features/car/hooks/CarContext';
import CarSummaryCard from '../../../features/car/components/CarSummaryCard';

import ProfileCard from '../../../features/profile/components/ProfileCard';

import {
  fetchMe,
  uploadAvatar,
  type ServerUser,
} from '../../../features/profile/services/profileServerApi';

export default function ProfileTab() {
  const router = useRouter();
  const { car } = useCar();

  const [profile, setProfile] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const me = await fetchMe();
      setProfile(me);
    } catch (e: any) {
      Alert.alert('Du är utloggad', e.message);
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePickAndUploadAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Behörighet krävs', 'Ge appen tillgång till Bilder.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // <-- ny API-form
        quality: 0.85,
      });

      if (result.canceled) return;

      setUploadingAvatar(true);
      const uri = result.assets[0].uri;

      await uploadAvatar(uri);

      Alert.alert('Klart', 'Din profilbild är uppdaterad.');
      await loadProfile();
    } catch (e: any) {
      Alert.alert('Fel', e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Laddar profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profile && (
        <View>
          <ProfileCard
            username={profile.username}
            email={profile.email}
            avatarUrl={profile.avatar_url}
            car={car ? `${car.make} ${car.model}` : undefined}
          />

          <TouchableOpacity
            style={[
              styles.buttonFull,
              { backgroundColor: uploadingAvatar ? '#555' : '#111' },
            ]}
            onPress={handlePickAndUploadAvatar}
            disabled={uploadingAvatar}
          >
            <Text style={styles.buttonText}>
              {uploadingAvatar ? 'Laddar upp...' : 'Ladda upp profilbild'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {car && <CarSummaryCard make={car.make} model={car.model} />}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4caf50' }]}
          onPress={() => router.push('../edit-profile')}
        >
          <Text style={styles.buttonText}>Ändra profil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196f3' }]}
          onPress={() => router.push('../edit-car')}
        >
          <Text style={styles.buttonText}>Ändra bil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonFull: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
