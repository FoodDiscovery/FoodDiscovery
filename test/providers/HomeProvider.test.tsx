import { Alert, Text, TouchableOpacity } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import HomeProvider, { useHome } from "../../src/Providers/HomeProvider";
import { useLocation } from "../../src/Providers/LocationProvider";

const mockUseLocation = useLocation as jest.Mock;
const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("../../src/Providers/LocationProvider", () => ({
  useLocation: jest.fn(),
}));

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

function HomeHarness() {
  const {
    loading,
    cuisineOptions,
    filteredBase,
    filteredNearby,
    headerSubtitle,
    sortMode,
    onPressSort,
    setQuery,
    toggleCuisine,
  } = useHome();

  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="cuisines">{cuisineOptions.join(",")}</Text>
      <Text testID="filteredCount">{String(filteredBase.length)}</Text>
      <Text testID="filteredNearbyCount">{String(filteredNearby.length)}</Text>
      <Text testID="subtitle">{headerSubtitle}</Text>
      <Text testID="sort">{sortMode}</Text>
      <TouchableOpacity onPress={() => setQuery("sushi")}>
        <Text>Search Sushi</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleCuisine("Japanese")}>
        <Text>Toggle Japanese</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressSort}>
        <Text>Toggle Sort</Text>
      </TouchableOpacity>
    </>
  );
}

function buildNearbyRestaurant(
  id: string,
  name: string,
  distance: number
): {
  location_id: number;
  distance_meters: number;
  latitude: number;
  longitude: number;
  restaurant: {
    id: string;
    name: string;
    owner_id: string;
    image_url: string | null;
    preview_images: string[] | null;
    cuisine_type: string | null;
  };
} {
  return {
    location_id: Number(id.replace("r", "")),
    distance_meters: distance,
    latitude: 0,
    longitude: 0,
    restaurant: {
      id,
      name,
      owner_id: "owner-1",
      image_url: null,
      preview_images: null,
      cuisine_type: null,
    },
  };
}

describe("HomeProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockRpc.mockImplementation((_fn: string, args: { radius_meters: number }) => {
      if (args.radius_meters === 50000) {
        return Promise.resolve({
          data: [
            buildNearbyRestaurant("r1", "Sushi Bay", 1000),
            buildNearbyRestaurant("r2", "Taco Town", 2000),
          ],
          error: null,
        });
      }
      return Promise.resolve({
        data: [
          buildNearbyRestaurant("r1", "Sushi Bay", 900),
          buildNearbyRestaurant("r2", "Taco Town", 1900),
        ],
        error: null,
      });
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "restaurants") {
        return {
          select: jest.fn((columns: string) => {
            if (columns === "id,name,description,cuisine_type,image_url,preview_images") {
              return Promise.resolve({
                data: [
                  {
                    id: "r1",
                    name: "Sushi Bay",
                    description: "Fresh rolls",
                    cuisine_type: "Japanese",
                    image_url: null,
                    preview_images: null,
                  },
                  {
                    id: "r2",
                    name: "Taco Town",
                    description: "Street tacos",
                    cuisine_type: "Mexican",
                    image_url: null,
                    preview_images: null,
                  },
                ],
                error: null,
              });
            }
            return {
              in: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: "r1",
                    image_url: "sushi.jpg",
                    preview_images: ["s1.jpg"],
                    cuisine_type: "Japanese",
                  },
                  {
                    id: "r2",
                    image_url: "taco.jpg",
                    preview_images: ["t1.jpg"],
                    cuisine_type: "Mexican",
                  },
                ],
                error: null,
              }),
            };
          }),
        };
      }
      return {};
    });
  });

  it("loads restaurants and supports search filtering", async () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: false,
    });

    const { getByText, getByTestId } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").props.children).toBe("false");
    });

    expect(getByTestId("cuisines").props.children).toBe("Japanese,Mexican");
    expect(getByTestId("filteredCount").props.children).toBe("2");

    fireEvent.press(getByText("Search Sushi"));
    await waitFor(() => {
      expect(getByTestId("filteredCount").props.children).toBe("1");
    });
  });

  it("alerts when trying distance sort without location", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: "denied",
      isLoading: false,
    });

    const { getByText, getByTestId } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    await waitFor(() => {
      expect(getByTestId("sort").props.children).toBe("name");
    });

    fireEvent.press(getByText("Toggle Sort"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Location needed",
      "To sort by distance, allow location access in iOS Settings for this app."
    );
    expect(getByTestId("sort").props.children).toBe("name");
  });

  it("alerts while location is still loading before distance sort", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: true,
    });

    const { getByText } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    fireEvent.press(getByText("Toggle Sort"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Location",
      "Getting your location… try again in a moment."
    );
  });

  it("switches to distance mode, filters nearby items, and switches back to name", async () => {
    mockUseLocation.mockReturnValue({
      location: { latitude: 37.77, longitude: -122.42 },
      errorMsg: null,
      isLoading: false,
    });

    const { getByText, getByTestId } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    await waitFor(() => {
      expect(getByTestId("sort").props.children).toBe("name");
    });

    fireEvent.press(getByText("Toggle Sort"));

    await waitFor(() => {
      expect(getByTestId("sort").props.children).toBe("distance");
      expect(getByTestId("subtitle").props.children).toBe("Distance (5km)");
      expect(getByTestId("filteredNearbyCount").props.children).toBe("2");
    });

    fireEvent.press(getByText("Search Sushi"));
    fireEvent.press(getByText("Toggle Japanese"));

    await waitFor(() => {
      expect(getByTestId("filteredNearbyCount").props.children).toBe("1");
    });

    fireEvent.press(getByText("Toggle Sort"));
    await waitFor(() => {
      expect(getByTestId("sort").props.children).toBe("name");
    });
  });

  it("applies cuisine filter to base restaurant list", async () => {
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: false,
    });

    const { getByText, getByTestId } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    await waitFor(() => {
      expect(getByTestId("filteredCount").props.children).toBe("2");
    });

    fireEvent.press(getByText("Toggle Japanese"));
    await waitFor(() => {
      expect(getByTestId("filteredCount").props.children).toBe("1");
    });
  });

  it("alerts when base restaurant load fails", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    mockUseLocation.mockReturnValue({
      location: null,
      errorMsg: null,
      isLoading: false,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "restaurants") {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "db down" },
          }),
        };
      }
      return {};
    });

    const { getByTestId } = render(
      <HomeProvider>
        <HomeHarness />
      </HomeProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").props.children).toBe("false");
    });
    expect(alertSpy).toHaveBeenCalledWith("Failed to load restaurants", "db down");
  });
});
