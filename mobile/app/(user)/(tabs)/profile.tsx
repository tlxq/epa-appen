import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCar } from '../../../features/car/hooks/CarContext';

import { getProfile } from '../../../features/profile/services/profileApi';
import CarSummaryCard from '../../../features/car/components/CarSummaryCard';

export default function ProfileTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const { car } = useCar(); //

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profile && (
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {profile.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.name?.[0] || '?'}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              {car && (
                <Text style={styles.car}>
                  {car.make} {car.model}
                </Text>
              )}
            </View>
          </View>
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
