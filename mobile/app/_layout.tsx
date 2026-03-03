import { Slot } from "expo-router";
import React from "react";
import { CarProvider } from "../features/car/context/CarContext";

export default function Layout() {
  return (
    <CarProvider>
      <Slot />
    </CarProvider>
  );
}
