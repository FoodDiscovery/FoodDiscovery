// constants for avatar storage
export const AVATAR_STORAGE_KEY_PREFIX = "avatar_url:";
export const AVATAR_BUCKET = "avatars";

export function getAvatarStorageKey(userId: string): string {
  return `${AVATAR_STORAGE_KEY_PREFIX}${userId}`;
}
