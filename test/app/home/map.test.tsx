import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

const mockUseLocation = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native-maps", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { View } = jest.requireActual(
    "react-native"
  ) as typeof import("react-native");

  const MockMapView = React.forwardRef(
    (
      { children, ...props }: { children?: React.ReactNode },
      ref: React.Ref<unknown>
    ) => {
      React.useImperativeHandle(ref, () => ({
        animateToRegion: jest.fn(),
      }));
      return React.createElement(View, { ...props, testID: "map-view" }, children);
    }
  );
  MockMapView.displayName = "MockMapView";

  const MockMarker = ({
    title,
    testID,
  }: {
    title?: string;
    testID?: string;
  }) => React.createElement(View, { testID: testID ?? `marker-${title}` });

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

jest.mock("../../../src/Providers/LocationProvider", () => ({
  useLocation: () => mockUseLocation(),
}));

jest.mock("../../../src/components/RestaurantModal", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return {
    __esModule: true,
    default: () => React.createElement("View"),
  };
});

import MapScreen from "../../../src/app/(home)/map";

describe("MapScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
    mockRpc.mockResolvedValue({ data: [], error: null });
  });

  it("shows loading text when location is loading", () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: true,
    });

    const { getByText } = render(<MapScreen />);
    expect(getByText("Searching for location...")).toBeTruthy();
  });

  it("shows error message when location has an error", () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: "Permission denied",
      isLoading: false,
    });

    const { getByText } = render(<MapScreen />);
    expect(getByText("Permission denied")).toBeTruthy();
  });

  it("shows fallback text when location is null without error", () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: false,
    });

    const { getByText } = render(<MapScreen />);
    expect(getByText("Location unavailable")).toBeTruthy();
    expect(getByText("Try Again")).toBeTruthy();
  });

  it("renders the map and Get Location button when location is available", async () => {
    mockUseLocation.mockReturnValue({
      location: { latitude: 40.0, longitude: -74.0 },
      errorMsg: null,
      isLoading: false,
    });
    mockRpc.mockResolvedValueOnce({
      data: [
        {
          location_id: 1,
          distance_meters: 1200,
          latitude: 40.01,
          longitude: -74.01,
          restaurant: { id: "r1", name: "Sushi Bay", owner_id: "owner-1" },
        },
      ],
      error: null,
    });

    const { getByTestId, getByText } = render(<MapScreen />);
    expect(getByTestId("map-view")).toBeTruthy();
    expect(getByText("Get Location")).toBeTruthy();
    await waitFor(() => {
      expect(getByTestId("marker-Sushi Bay")).toBeTruthy();
    });
  });

  it("calls router.replace when Try Again is pressed", () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: "Error",
      isLoading: false,
    });

    const { getByText } = render(<MapScreen />);
    fireEvent.press(getByText("Try Again"));

    expect(router.replace).toHaveBeenCalledWith("/(home)/map");
  });
});
