import React from "react";
import { useRouter } from "expo-router";
import ProfileForm from "../../features/profile/components/ProfileForm";

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <ProfileForm
      onSave={() => {
        router.replace({
          pathname: "/(user)/(tabs)/profile",
          params: { refresh: String(Date.now()) },
        });
      }}
    />
  );
}
