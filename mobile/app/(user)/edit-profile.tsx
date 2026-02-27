import React from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import ProfileForm from '../../features/profile/components/ProfileForm';

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <ProfileForm
      onSave={() => {
        Alert.alert('Sparat!', 'Din profil är uppdaterad.');
        router.back();
      }}
    />
  );
}
