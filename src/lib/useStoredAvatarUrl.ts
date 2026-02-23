import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAvatarStorageKey } from "./avatarStorage";

// uses cached avatar url from AsyncStorage
export function useStoredAvatarUrl(userId: string | null): {
  avatarUri: string | null;
  loading: boolean;
  reload: () => Promise<void>;
} {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const storageKey = userId ? getAvatarStorageKey(userId) : null;

  const reload = useCallback(async () => {
    if (!storageKey) {
      setAvatarUri(null);
      setLoading(false);
      return;
    }
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      setAvatarUri(stored);
    } catch {
      setAvatarUri(null);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  return { avatarUri, loading, reload };
}
