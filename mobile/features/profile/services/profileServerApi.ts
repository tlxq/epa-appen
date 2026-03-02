import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ttdevs.com';

export type ServerUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
  avatar_url?: string | null;
};

export async function fetchMyProfile(): Promise<ServerUser> {
  const jwt = await AsyncStorage.getItem('jwt');
  if (!jwt) throw new Error('Ingen JWT hittades (inte inloggad)');

  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Kunde inte hämta profil');

  return data.user;
}

export async function uploadMyAvatar(
  uri: string,
): Promise<{ avatarUrl: string }> {
  const jwt = await AsyncStorage.getItem('jwt');
  if (!jwt) throw new Error('Ingen JWT hittades (inte inloggad)');

  const form = new FormData();

  // React Native FormData file object
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Kunde inte ladda upp bild');

  return { avatarUrl: data.avatarUrl };
}

export function resolveAvatarUrl(avatar_url?: string | null) {
  if (!avatar_url) return null;

  if (avatar_url.startsWith('http://') || avatar_url.startsWith('https://'))
    return avatar_url;
  return `${API_URL}${avatar_url}`;
}
