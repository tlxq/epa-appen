import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { startLocationSharing, stopLocationSharing, postCurrentLocation } from "./locationService";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";

interface LocationSharingContextValue {
  sharing: boolean;
  toggling: boolean;
  toggleSharing: () => Promise<void>;
}

const LocationSharingContext = createContext<LocationSharingContextValue>({
  sharing: false,
  toggling: false,
  toggleSharing: async () => {},
});

export const LocationSharingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sharing, setSharing] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Load initial sharing state from backend
  useEffect(() => {
    (async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        if (!jwt) return;
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { user } = await res.json();
        setSharing(!!user?.location_sharing);
        // Restart sharing if it was on — posts location immediately + restarts bg task
        if (user?.location_sharing) {
          await startLocationSharing().catch(() => {});
        }
      } catch {
        // not logged in yet
      }
    })();
  }, []);

  const toggleSharing = useCallback(async () => {
    setToggling(true);
    try {
      const newSharing = !sharing;
      const jwt = await AsyncStorage.getItem("jwt");
      if (!jwt) return;

      if (newSharing) {
        await startLocationSharing();
      } else {
        await stopLocationSharing();
      }

      await fetch(`${API_URL}/api/users/me/location-sharing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ sharing: newSharing }),
      });

      setSharing(newSharing);
    } catch (e: any) {
      // Re-throw so the UI can show the error
      throw e;
    } finally {
      setToggling(false);
    }
  }, [sharing]);

  return (
    <LocationSharingContext.Provider value={{ sharing, toggling, toggleSharing }}>
      {children}
    </LocationSharingContext.Provider>
  );
};

export const useLocationSharing = () => useContext(LocationSharingContext);
