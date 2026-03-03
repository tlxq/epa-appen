import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchMe, updateMe } from "../../profile/services/profileApi";
import { fetchMakes } from "../services/carApi";

type Car = { make: string; model: string } | null;

const CarContext = createContext<{
  car: Car;
  updateCar: (newCar: Car) => Promise<void>;
}>({ car: null, updateCar: async () => {} });

export const CarProvider = ({ children }: { children: React.ReactNode }) => {
  const [car, setCar] = useState<Car>(null);

  // Load from cache first, then sync from backend
  useEffect(() => {
    (async () => {
      try {
        // Quick load from local cache
        const cached = await AsyncStorage.getItem("myCar");
        if (cached) setCar(JSON.parse(cached));

        // Sync from backend (source of truth)
        const me = await fetchMe();
        if (me.car_make || me.car_model) {
          const backendCar = {
            make: me.car_make ?? "",
            model: me.car_model ?? "",
          };
          setCar(backendCar);
          await AsyncStorage.setItem("myCar", JSON.stringify(backendCar));
        }
      } catch {
        // Not logged in yet — ignore, car stays null
      }

      // Pre-warm the NHTSA makes cache in the background so edit-car opens instantly
      fetchMakes().catch(() => {});
    })();
  }, []);

  const updateCar = async (newCar: Car) => {
    // Optimistic local update
    setCar(newCar);
    await AsyncStorage.setItem("myCar", JSON.stringify(newCar));

    // Persist to backend
    await updateMe({
      car_make: newCar?.make ?? "",
      car_model: newCar?.model ?? "",
    });
  };

  return (
    <CarContext.Provider value={{ car, updateCar }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => useContext(CarContext);
