// features/profile/services/profileApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getProfile() {
  const json = await AsyncStorage.getItem('profile');
  return json ? JSON.parse(json) : null;
}

export async function updateProfile(profile: any) {
  await AsyncStorage.setItem('profile', JSON.stringify(profile));
  return profile;
}
