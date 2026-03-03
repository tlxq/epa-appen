import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/hooks/use-theme";
import { fetchNearbyUsers } from "@/features/chat/chatApi";
import { useLocationSharing } from "@/features/location/LocationContext";
import { postCurrentLocation } from "@/features/location/locationService";

const POLL_MS = 15_000;

type NearbyUser = Awaited<ReturnType<typeof fetchNearbyUsers>>[number];

export default function MapScreen() {
  const { colors, fontSize, fontWeight, spacing, radius } = useTheme();
  const router = useRouter();
  const { sharing } = useLocationSharing();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);

  const loadNearby = useCallback(async () => {
    try {
      const users = await fetchNearbyUsers();
      setNearbyUsers(users);
    } catch {}
  }, []);

  // Request permission + get location once
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Ingen GPS-access", "Du måste tillåta platstjänster!");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  // Poll nearby users + keep own location fresh while map is focused
  useFocusEffect(
    useCallback(() => {
      loadNearby();
      const nearbyInterval = setInterval(loadNearby, POLL_MS);

      // Post own location every 30s if sharing (covers Expo Go — no background task)
      let locationInterval: ReturnType<typeof setInterval> | null = null;
      if (sharing) {
        postCurrentLocation();
        locationInterval = setInterval(postCurrentLocation, 30_000);
      }

      return () => {
        clearInterval(nearbyInterval);
        if (locationInterval) clearInterval(locationInterval);
      };
    }, [loadNearby, sharing]),
  );

  const openChat = (user: NearbyUser) => {
    router.push({
      pathname: "/(user)/chat/[userId]" as any,
      params: {
        userId: user.id,
        username: user.username,
        name: user.name ?? "",
        avatar: user.avatar_url ?? "",
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Ingen platsdata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: user.location_lat,
              longitude: user.location_lng,
            }}
            tracksViewChanges={false}
          >
            {/* Custom marker */}
            <View style={styles.markerContainer}>
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={[
                    styles.markerAvatar,
                    { borderColor: colors.primary },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.markerAvatar,
                    styles.markerAvatarFallback,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: fontWeight.bold,
                      fontSize: 14,
                    }}
                  >
                    {(user.name || user.username)[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.markerLabel,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 11,
                    fontWeight: fontWeight.semibold,
                  }}
                  numberOfLines={1}
                >
                  {user.name || user.username}
                </Text>
              </View>
              <View
                style={[
                  styles.markerArrow,
                  { borderTopColor: colors.surface },
                ]}
              />
            </View>

            <Callout tooltip onPress={() => openChat(user)}>
              <View
                style={[
                  styles.callout,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: fontWeight.bold,
                    fontSize: fontSize.md,
                  }}
                >
                  {user.name || user.username}
                </Text>
                <Text
                  style={{ color: colors.textMuted, fontSize: fontSize.sm }}
                >
                  @{user.username}
                </Text>
                {(user.car_make || user.car_model) && (
                  <View style={styles.calloutCar}>
                    <Ionicons
                      name="car-sport-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: fontSize.sm,
                        marginLeft: 4,
                      }}
                    >
                      {[user.car_make, user.car_model]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.chatBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.md,
                      marginTop: spacing.sm,
                    },
                  ]}
                  onPress={() => openChat(user)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={14}
                    color={colors.background}
                  />
                  <Text
                    style={{
                      color: colors.background,
                      fontWeight: fontWeight.semibold,
                      fontSize: fontSize.sm,
                      marginLeft: 6,
                    }}
                  >
                    Chatta
                  </Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Online count badge */}
      {nearbyUsers.length > 0 && (
        <View
          style={[
            styles.onlineBadge,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.onlineDot, { backgroundColor: colors.success }]}
          />
          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
            }}
          >
            {nearbyUsers.length} online
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%", height: "100%" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Custom marker
  markerContainer: { alignItems: "center" },
  markerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  markerAvatarFallback: { justifyContent: "center", alignItems: "center" },
  markerLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    maxWidth: 100,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },

  // Callout
  callout: {
    padding: 12,
    minWidth: 160,
    maxWidth: 220,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  calloutCar: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // Online badge
  onlineBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
});
