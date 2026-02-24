import { render, waitFor } from "@testing-library/react-native";
import CustomerProfileScreen from "../../../src/app/(home)/profile";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../src/components/CustomerProfileIcon", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return () => React.createElement(Text, null, "Mock CustomerProfileIcon");
});

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: () => ({
    session: { user: { id: "user-1", email: "test@test.com" } },
  }),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { full_name: "Jane" }, error: null }),
        }),
      }),
    }),
    auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
  },
}));

describe("CustomerProfileScreen", () => {
  it("renders the profile screen title", async () => {
    const { getByText } = render(<CustomerProfileScreen />);
    expect(getByText("Mock CustomerProfileIcon")).toBeTruthy();
    expect(getByText("Tap the icon to change your profile photo")).toBeTruthy();
    expect(getByText("Settings / Profile")).toBeTruthy();
    await waitFor(() => {
      expect(getByText("Jane")).toBeTruthy();
    });
  });
});
