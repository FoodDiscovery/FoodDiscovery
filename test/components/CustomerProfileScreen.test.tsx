import { fireEvent, render, waitFor } from "@testing-library/react-native";
import CustomerProfileScreen from "../../src/app/(home)/profile";

const mockUseAuth = jest.fn();
const mockFrom = jest.fn();
const mockSignOut = jest.fn();

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../src/Providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../src/components/CustomerProfileIcon", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return () => React.createElement(Text, null, "Mock CustomerProfileIcon");
});

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

describe("CustomerProfileScreen", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockFrom.mockReset();
    mockSignOut.mockReset();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("renders icon + hint and loads full name when signed in", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1", email: "test@test.com" } },
    });

    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { full_name: "Jane" }, error: null }),
        }),
      }),
    });

    const screen = render(<CustomerProfileScreen />);

    expect(screen.getByText("Mock CustomerProfileIcon")).toBeTruthy();
    expect(screen.getByText("Tap the icon to change your profile photo")).toBeTruthy();
    expect(screen.getByText("Settings / Profile")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Jane")).toBeTruthy();
    });
  });

  it("does not render icon + hint when not signed in", () => {
    mockUseAuth.mockReturnValue({ session: null });

    const screen = render(<CustomerProfileScreen />);

    expect(screen.queryByText("Mock CustomerProfileIcon")).toBeNull();
    expect(screen.queryByText("Tap the icon to change your profile photo")).toBeNull();
    expect(screen.getByText("Settings / Profile")).toBeTruthy();
    expect(screen.getByText("Signed in")).toBeTruthy();
  });

  it("calls supabase signOut when Sign Out pressed", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1", email: "test@test.com" } },
    });

    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { full_name: "" }, error: null }),
        }),
      }),
    });

    const screen = render(<CustomerProfileScreen />);
    fireEvent.press(screen.getByText("Sign Out"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});

