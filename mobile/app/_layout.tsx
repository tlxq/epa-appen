import { Slot } from 'expo-router';
import React from 'react';
import { CarProvider } from '../features/car/hooks/CarContext';

export default function Layout() {
  return (
    <CarProvider>
      <Slot />
    </CarProvider>
  );
}
