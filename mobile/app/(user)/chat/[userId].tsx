import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { fetchMessages, sendMessage, type Message } from "@/features/chat/chatApi";
import { useTheme } from "@/hooks/use-theme";

const POLL_MS = 3000;

export default function ChatScreen() {
  const { userId, username, name, avatar } = useLocalSearchParams<{
    userId: string;
    username: string;
    name?: string;
    avatar?: string;
  }>();
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const [myId, setMyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const displayName = name || username;

  useEffect(() => {
    navigation.setOptions({ title: displayName });
    (async () => {
      const jwt = await AsyncStorage.getItem("jwt");
      if (jwt) {
        const decoded: any = jwtDecode(jwt);
        setMyId(decoded.userId);
      }
    })();
  }, [navigation, displayName]);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const msgs = await fetchMessages(userId);
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    try {
      const msg = await sendMessage(userId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setText(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.from_user_id === myId;
    return (
      <View
        style={[
          styles.bubble,
          isMe
            ? [styles.bubbleMe, { backgroundColor: colors.primary }]
            : [styles.bubbleThem, { backgroundColor: colors.surface }],
        ]}
      >
        <Text
          style={{
            color: isMe ? colors.background : colors.text,
            fontSize: fontSize.md,
          }}
        >
          {item.content}
        </Text>
        <Text
          style={{
            color: isMe ? colors.background : colors.textMuted,
            fontSize: fontSize.xs,
            marginTop: 3,
            alignSelf: "flex-end",
            opacity: 0.7,
          }}
        >
          {new Date(item.created_at).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header user info bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        ) : (
          <View
            style={[
              styles.headerAvatar,
              styles.headerAvatarFallback,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: fontWeight.bold,
                fontSize: fontSize.md,
              }}
            >
              {displayName[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: colors.text,
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.md,
            marginLeft: spacing.sm,
          }}
        >
          {displayName}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderRadius: radius.full,
              fontSize: fontSize.md,
            },
          ]}
          placeholder="Aa..."
          placeholderTextColor={colors.placeholder}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                text.trim() ? colors.primary : colors.surfaceElevated,
              borderRadius: radius.full,
            },
          ]}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? colors.background : colors.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerAvatarFallback: { justifyContent: "center", alignItems: "center" },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 18,
    marginVertical: 3,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
