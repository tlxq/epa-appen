import React from "react";
import CarForm from "../../features/car/components/CarForm";
import { useRouter } from "expo-router";

export default function EditCarScreenRoute() {
  const router = useRouter();

  return <CarForm onSave={() => router.back()} />;
}
