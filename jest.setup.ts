process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "test-anon-key";

jest.mock("expo-sqlite/localStorage/install", () => ({}));

jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

if (!(globalThis as { localStorage?: Storage }).localStorage) {
  const store = new Map<string, string>();
  (globalThis as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

jest.mock("react-native/Libraries/Modal/Modal", () => {
  const mockReact = jest.requireActual("react") as typeof import("react");
  const MockModal = ({ children }: { children?: import("react").ReactNode }) =>
    mockReact.createElement(mockReact.Fragment, null, children);

  return {
    __esModule: true,
    default: MockModal,
  };
});
