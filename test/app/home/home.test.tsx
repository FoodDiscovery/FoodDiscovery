import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import HomeScreen from "../../../src/app/(home)/home";
import { router } from "expo-router";

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("../../../src/components/ProfileHeaderIcon", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

jest.mock("../../../src/Providers/LocationProvider", () => ({
  useLocation: () => ({
    location: { latitude: 40.0, longitude: -74.0 },
    errorMsg: null,
    isLoading: false,
  }),
}));

jest.mock("../../../src/Providers/CartProvider", () => ({
  useCart: () => ({
    itemCount: 0,
  }),
}));

const restaurants = [
  {
    id: "r1",
    name: "Pizza Palace",
    description: "Best pizza in town",
    cuisine_type: "Italian",
    image_url: null,
  },
  {
    id: "r2",
    name: "Sushi Spot",
    description: "Fresh sushi",
    cuisine_type: "Japanese",
    image_url: "https://example.com/sushi.jpg",
  },
];

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockFrom.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: restaurants, error: null }),
    });
    mockRpc.mockResolvedValue({ data: [], error: null });
  });

  it("renders restaurant cards after loading", async () => {
    const { getByText, getAllByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });

    expect(getByText("Sushi Spot")).toBeTruthy();
    expect(getAllByText("Italian").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Japanese").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no restaurants match search", async () => {
    const { getByText, getByPlaceholderText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText("Search by name or cuisine"),
      "nonexistent"
    );

    await waitFor(() => {
      expect(getByText("No results")).toBeTruthy();
    });
  });

  it("filters restaurants by search query", async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <HomeScreen />
    );

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText("Search by name or cuisine"),
      "pizza"
    );

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
      expect(queryByText("Sushi Spot")).toBeNull();
    });
  });

  it("navigates to restaurant page on card press", async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });

    fireEvent.press(getByText("Pizza Palace"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(home)/restaurant/[id]",
      params: { id: "r1" },
    });
  });

  it("navigates to cart when cart icon is pressed", async () => {
    const { getByLabelText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByLabelText("Open cart")).toBeTruthy();
    });

    fireEvent.press(getByLabelText("Open cart"));

    expect(router.push).toHaveBeenCalledWith("/(home)/cart");
  });

  it("renders cuisine chips inside the filters modal", async () => {
    const { getAllByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getAllByText("Italian").length).toBeGreaterThanOrEqual(1);
    });

    expect(getAllByText("Japanese").length).toBeGreaterThanOrEqual(1);
  });

  it("alerts when supabase returns an error", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Network error" },
      }),
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    render(<HomeScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to load restaurants",
        "Network error"
      );
    });
  });
});
