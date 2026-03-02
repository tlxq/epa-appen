import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  fetchMe,
  type ServerUser,
} from '../../../features/profile/services/profileServerApi';

export default function ProfileTab() {
  const router = useRouter();
  const navigation = useNavigation();

  const [profile, setProfile] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const me = await fetchMe();
      setProfile(me);
    } catch (e: any) {
      Alert.alert('Fel', e.message);
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Lägg kugghjul i header (proffsigt)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('../edit-profile')}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="settings-outline" size={22} />
        </TouchableOpacity>
      ),
      title: 'Profil',
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Laddar profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Kunde inte ladda profilen.</Text>
      </View>
    );
  }

  const displayName = profile.name?.trim() || profile.username;
  const carText =
    profile.car_make || profile.car_model
      ? `${profile.car_make || ''} ${profile.car_model || ''}`.trim()
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.meta}>
          <Text style={styles.metaRow}>Roll: {profile.role}</Text>
          {carText ? <Text style={styles.metaRow}>Bil: {carText}</Text> : null}
        </View>

        <Text style={styles.hint}>
          Tryck på kugghjulet för att redigera din profil.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  avatar: { width: 92, height: 92, borderRadius: 46, marginBottom: 12 },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 12,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800' },
  email: { marginTop: 4, fontSize: 14, color: '#666' },
  bio: { marginTop: 12, fontSize: 14, color: '#222', textAlign: 'center' },
  meta: { marginTop: 14, width: '100%' },
  metaRow: { fontSize: 13, color: '#555', marginTop: 4 },
  hint: { marginTop: 16, fontSize: 12, color: '#777' },
});
