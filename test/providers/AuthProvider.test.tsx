import { Text } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import AuthProvider, { useAuth } from "../../src/Providers/AuthProvider";

const mockReplace = jest.fn();
const mockUseSegments = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSegments: () => mockUseSegments(),
}));

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
}));

function SessionProbe() {
  const { session } = useAuth();
  return <Text>{session ? "signed-in" : "signed-out"}</Text>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it("redirects signed-out users away from protected routes", async () => {
    mockUseSegments.mockReturnValue(["home"]);
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { getByText } = render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText("signed-out")).toBeTruthy();
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign-in");
    });
  });

  it("redirects signed-in users away from auth routes", async () => {
    mockUseSegments.mockReturnValue(["(auth)"]);
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "u-1" } },
      },
    });

    const { getByText } = render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText("signed-in")).toBeTruthy();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
