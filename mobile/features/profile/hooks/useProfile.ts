import { useState, useEffect, useCallback } from "react";
import { fetchMe, type ServerUser } from "../services/profileApi";

export function useProfile() {
  const [profile, setProfile] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const me = await fetchMe();
      setProfile(me);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profile, loading, error, reload };
}
