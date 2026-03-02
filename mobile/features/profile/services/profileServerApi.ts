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

export async function updateMe(input: {
  username: string;
}): Promise<ServerUser> {
  const jwt = await getJwt();

  const res = await fetch(`${API_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Kunde inte uppdatera profil');

  return data.user;
}

function guessFileTypeFromUri(uri: string) {
  const lower = uri.toLowerCase();

  if (lower.endsWith('.png')) return { type: 'image/png', name: 'avatar.png' };
  if (lower.endsWith('.webp'))
    return { type: 'image/webp', name: 'avatar.webp' };
  if (lower.endsWith('.heic'))
    return { type: 'image/heic', name: 'avatar.heic' };
  if (lower.endsWith('.heif'))
    return { type: 'image/heif', name: 'avatar.heif' };

  // default
  return { type: 'image/jpeg', name: 'avatar.jpg' };
}

export async function uploadAvatar(uri: string) {
  const jwt = await getJwt();

  const { type, name } = guessFileTypeFromUri(uri);

  const form = new FormData();
  form.append('avatar', { uri, name, type } as any);

  const res = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  // Läs alltid som text för bättre felsökning
  const text = await res.text();
  console.log('uploadAvatar status:', res.status);
  console.log('uploadAvatar response:', text);

  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {}

  if (!res.ok) {
    throw new Error(
      data?.details || data?.error || `Upload failed (${res.status})`,
    );
  }

  return data.avatarUrl as string;
}
