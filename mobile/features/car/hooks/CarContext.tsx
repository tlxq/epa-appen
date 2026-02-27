import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CarContext = createContext<any>(null);

export const CarProvider = ({ children }: any) => {
  const [car, setCar] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const c = await AsyncStorage.getItem('myCar');
      setCar(c ? JSON.parse(c) : null);
    })();
  }, []);

  const updateCar = async (newCar: any) => {
    await AsyncStorage.setItem('myCar', JSON.stringify(newCar));
    setCar(newCar);
  };

  return (
    <CarContext.Provider value={{ car, updateCar }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => useContext(CarContext);
