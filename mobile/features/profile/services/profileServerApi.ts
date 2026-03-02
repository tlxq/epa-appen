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

async function getJwt() {
  const jwt = await AsyncStorage.getItem('jwt');
  if (!jwt) throw new Error('Inte inloggad (JWT saknas)');
  return jwt;
}

export async function fetchMe(): Promise<ServerUser> {
  const jwt = await getJwt();

  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Kunde inte hämta profil');

  return data.user;
}

export async function uploadAvatar(uri: string) {
  const jwt = await getJwt();

  const form = new FormData();
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Kunde inte ladda upp bild');

  return data.avatarUrl as string;
}
