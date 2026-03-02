import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useCar } from '../../../features/car/hooks/CarContext';
import CarSummaryCard from '../../../features/car/components/CarSummaryCard';

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.username}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <Text style={styles.role}>Roll: {profile.role}</Text>

              {car && (
                <Text style={styles.car}>
                  {car.make} {car.model}
                </Text>
              )}
            </View>
          </View>

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

      {/* Bil Card */}
      {car && <CarSummaryCard make={car.make} model={car.model} />}

      {/* Knapp-rad */}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  role: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  car: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
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
    marginTop: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
