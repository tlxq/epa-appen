import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { fetchConversations, type Conversation } from "@/features/chat/chatApi";
import { useTheme } from "@/hooks/use-theme";

export default function ChatsTab() {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openChat = (conv: Conversation) => {
    router.push({
      pathname: "/(user)/chat/[userId]" as any,
      params: {
        userId: conv.other_user_id,
        username: conv.other_username,
        name: conv.other_name ?? "",
        avatar: conv.other_avatar_url ?? "",
      },
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const displayName = item.other_name || item.other_username;
    const time = new Date(item.created_at).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        {item.other_avatar_url ? (
          <Image
            source={{ uri: item.other_avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.avatarFallback,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: fontWeight.bold,
                fontSize: fontSize.lg,
              }}
            >
              {displayName[0]?.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <View style={styles.rowTop}>
            <Text
              style={{
                color: colors.text,
                fontWeight: item.unread_count > 0 ? fontWeight.bold : fontWeight.regular,
                fontSize: fontSize.md,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
              {time}
            </Text>
          </View>
          <View style={styles.rowBottom}>
            <Text
              style={{
                color: item.unread_count > 0 ? colors.text : colors.textMuted,
                fontSize: fontSize.sm,
                flex: 1,
                fontWeight: item.unread_count > 0 ? fontWeight.medium : fontWeight.regular,
              }}
              numberOfLines={1}
            >
              {item.content}
            </Text>
            {item.unread_count > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontSize: 11,
                    fontWeight: fontWeight.bold,
                  }}
                >
                  {item.unread_count > 99 ? "99+" : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {conversations.length === 0 ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
            Inga konversationer ännu
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSize.sm,
              marginTop: spacing.sm,
              textAlign: "center",
              paddingHorizontal: spacing.xl,
            }}
          >
            Hitta EPA-förare på kartan och starta ett samtal!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.other_user_id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
