import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Thin JSON wrapper around AsyncStorage. All reads/writes are local-only;
 * no network calls are made. Failures are caught and logged so a storage
 * error never crashes the app — callers receive `null` and fall back to
 * in-memory defaults.
 */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[genericStorage] Failed to read key "${key}"`, error);
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[genericStorage] Failed to write key "${key}"`, error);
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[genericStorage] Failed to remove key "${key}"`, error);
  }
}
