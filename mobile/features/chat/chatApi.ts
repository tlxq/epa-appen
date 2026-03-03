import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.ttdevs.com";

async function authHeaders() {
  const jwt = await AsyncStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };
}

export interface ChatUser {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: string;
  other_user_id: string;
  other_username: string;
  other_name: string | null;
  other_avatar_url: string | null;
  unread_count: number;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/api/chat`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Kunde inte hämta konversationer");
  const { conversations } = await res.json();
  return conversations;
}

export async function fetchMessages(
  userId: string,
  before?: string,
): Promise<Message[]> {
  const url = before
    ? `${API_URL}/api/chat/${userId}?before=${encodeURIComponent(before)}`
    : `${API_URL}/api/chat/${userId}`;
  const res = await fetch(url, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Kunde inte hämta meddelanden");
  const { messages } = await res.json();
  return messages;
}

export async function sendMessage(
  toUserId: string,
  content: string,
): Promise<Message> {
  const res = await fetch(`${API_URL}/api/chat/${toUserId}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Kunde inte skicka meddelande");
  }
  const { message } = await res.json();
  return message;
}

export async function fetchNearbyUsers(): Promise<
  Array<{
    id: string;
    username: string;
    name: string | null;
    avatar_url: string | null;
    car_make: string | null;
    car_model: string | null;
    location_lat: number;
    location_lng: number;
    location_updated_at: string;
  }>
> {
  const res = await fetch(`${API_URL}/api/users/locations`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Kunde inte hämta positioner");
  const { users } = await res.json();
  return users;
}
