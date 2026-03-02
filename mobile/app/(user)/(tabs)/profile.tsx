import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useCar } from '../../../features/car/hooks/CarContext';
import CarSummaryCard from '../../../features/car/components/CarSummaryCard';

import {
  fetchMyProfile,
  uploadMyAvatar,
  resolveAvatarUrl,
  type ServerUser,
} from '../../../features/profile/services/profileServerApi';

export default function ProfileTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<ServerUser | null>(null);
  const { car } = useCar();

  async function load() {
    try {
      const p = await fetchMyProfile();
      setProfile(p);
    } catch (e: any) {
      Alert.alert('Du är utloggad', e.message);
      router.replace('/(auth)/login');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleUploadAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Behörighet krävs', 'Du behöver ge tillgång till Bilder.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      await uploadMyAvatar(uri);
      Alert.alert('Klart', 'Din profilbild är uppdaterad.');

      // Ladda om profilen så vi får ny avatar_url
      await load();
    } catch (e: any) {
      Alert.alert('Fel', e.message);
    }
  };

  const avatarUri = resolveAvatarUrl(profile?.avatar_url);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profile && (
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
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
              {car && (
                <Text style={styles.car}>
                  {car.make} {car.model}
                </Text>
              )}
              <Text style={styles.role}>Roll: {profile.role}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#111', marginTop: 14 }]}
            onPress={handleUploadAvatar}
          >
            <Text style={styles.buttonText}>Ladda upp profilbild</Text>
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
  car: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  role: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
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
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
