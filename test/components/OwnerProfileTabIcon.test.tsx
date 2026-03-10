import { act, render, waitFor } from "@testing-library/react-native";
import OwnerProfileTabIcon from "../../src/components/OwnerProfileTabIcon";
import { setOwnerLogoUrl } from "../../src/lib/ownerLogoStore";

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const focusEffects: (() => void)[] = [];

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (fn: () => void) => {
    focusEffects.push(fn);
  },
}));

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

jest.mock("../../src/components/CachedImage", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return ({ uri }: { uri?: string | null }) =>
    uri ? React.createElement(Text, { testID: "owner-profile-tab-icon-image" }, uri) : null;
});

jest.mock("../../src/components/styles", () => ({
  getAvatarStyle: () => ({}),
}));

jest.mock("@react-native-vector-icons/fontawesome", () => ({
  __esModule: true,
  default: () => null,
}));

function selectMaybeSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("OwnerProfileTabIcon", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    focusEffects.length = 0;
    setOwnerLogoUrl(null);
  });

  it("loads the saved owner logo when focused", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-1" } } });
    mockFrom.mockReturnValue(
      selectMaybeSingle({
        data: { image_url: "https://cdn.example.com/owner-logo.jpg?t=123" },
      })
    );

    const screen = render(<OwnerProfileTabIcon color="#000" size={24} />);
    await act(async () => {
      focusEffects[0]?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId("owner-profile-tab-icon-image")).toBeTruthy();
      expect(screen.getByText("https://cdn.example.com/owner-logo.jpg?t=123")).toBeTruthy();
    });
  });

  it("updates immediately when the owner logo store changes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const screen = render(<OwnerProfileTabIcon color="#000" size={24} />);
    await act(async () => {
      focusEffects[0]?.();
      await Promise.resolve();
    });

    expect(screen.queryByTestId("owner-profile-tab-icon-image")).toBeNull();

    act(() => {
      setOwnerLogoUrl("https://cdn.example.com/updated-owner-logo.jpg?t=456");
    });

    expect(screen.getByTestId("owner-profile-tab-icon-image")).toBeTruthy();
    expect(screen.getByText("https://cdn.example.com/updated-owner-logo.jpg?t=456")).toBeTruthy();
  });
});
