import React from 'react';
import CarForm from '../../features/car/components/CarForm';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function EditCarScreenRoute() {
  const router = useRouter();

  return (
    <CarForm
      onSave={() => {
        Alert.alert('Sparat!', 'Din bil är sparad.');
        router.back();
      }}
    />
  );
}
