import { fireEvent, render } from "@testing-library/react-native";
import ProfileHeaderIcon from "../../src/components/ProfileHeaderIcon";

const mockUseAuth = jest.fn();
const mockUseStoredAvatarUrl = jest.fn();
const mockRouterPush = jest.fn();
const mockReload = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (fn: () => void) => fn(),
}));

jest.mock("../../src/Providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../src/lib/useStoredAvatarUrl", () => ({
  useStoredAvatarUrl: (userId: string | null) => mockUseStoredAvatarUrl(userId),
}));

jest.mock("../../src/components/styles", () => ({
  profileHeaderIconStyles: {
    icon: {},
    avatarImage: {},
    placeholder: {},
  },
  PROFILE_HEADER_ICON_COLOR: "#0B2D5B",
}));

jest.mock("@react-native-vector-icons/fontawesome", () => ({
  __esModule: true,
  default: () => null,
}));

describe("ProfileHeaderIcon", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseStoredAvatarUrl.mockReset();
    mockRouterPush.mockReset();
    mockReload.mockReset();
    mockUseStoredAvatarUrl.mockReturnValue({
      avatarUri: null,
      reload: mockReload,
    });
  });

  it("renders with placeholder when no avatar is stored", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1", email: "test@test.com" } },
    });

    const screen = render(<ProfileHeaderIcon />);

    expect(screen.getByTestId("profile-header-icon")).toBeTruthy();
    expect(screen.getByTestId("profile-header-icon-placeholder")).toBeTruthy();
    expect(screen.queryByTestId("profile-header-icon-image")).toBeNull();
  });

  it("renders image when avatar URL is stored", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockUseStoredAvatarUrl.mockReturnValue({
      avatarUri: "https://cdn.example.com/avatar.jpg",
      reload: mockReload,
    });

    const screen = render(<ProfileHeaderIcon />);

    expect(screen.getByTestId("profile-header-icon")).toBeTruthy();
    expect(screen.getByTestId("profile-header-icon-image")).toBeTruthy();
    expect(screen.queryByTestId("profile-header-icon-placeholder")).toBeNull();
  });

  it("navigates to profile when pressed", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });

    const screen = render(<ProfileHeaderIcon />);

    fireEvent.press(screen.getByTestId("profile-header-icon"));

    expect(mockRouterPush).toHaveBeenCalledWith("/(home)/profile");
  });

  it("passes userId from session to useStoredAvatarUrl", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-42" } },
    });

    render(<ProfileHeaderIcon />);

    expect(mockUseStoredAvatarUrl).toHaveBeenCalledWith("user-42");
  });

  it("passes null to useStoredAvatarUrl when not signed in", () => {
    mockUseAuth.mockReturnValue({ session: null });

    render(<ProfileHeaderIcon />);

    expect(mockUseStoredAvatarUrl).toHaveBeenCalledWith(null);
  });

  it("has accessible label for profile button", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });

    const screen = render(<ProfileHeaderIcon />);

    expect(screen.getByLabelText("Go to profile")).toBeTruthy();
  });
});
