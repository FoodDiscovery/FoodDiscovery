import React from "react";
import { Image } from "react-native";
import { render } from "@testing-library/react-native";
import RestaurantList from "../../../src/components/home/RestaurantList";
import { useHome } from "../../../src/Providers/HomeProvider";

jest.mock("../../../src/Providers/HomeProvider", () => ({
  useHome: jest.fn(),
}));

describe("RestaurantList", () => {
  it("renders loading state", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      loading: true,
      activeList: [],
      sortMode: "name",
      restaurantDistances: new Map(),
    });

    const { getByText } = render(<RestaurantList />);
    expect(getByText("Loading…")).toBeTruthy();
  });

  it("renders empty state when list is empty", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      loading: false,
      activeList: [],
      sortMode: "name",
      restaurantDistances: new Map(),
    });

    const { getByText } = render(<RestaurantList />);
    expect(getByText("No results")).toBeTruthy();
  });

  it("renders name-sorted restaurants with computed distance and preview image fallback", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      loading: false,
      activeList: [
        {
          id: "r1",
          name: "Taco Town",
          cuisine_type: "Mexican",
          image_url: null,
          preview_images: ["https://example.com/preview.jpg"],
        },
      ],
      sortMode: "name",
      restaurantDistances: new Map([["r1", 1609.34]]),
    });

    const { getByText, UNSAFE_getByType } = render(<RestaurantList />);
    expect(getByText("Taco Town")).toBeTruthy();
    expect(getByText("1.0 mi")).toBeTruthy();

    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: "https://example.com/preview.jpg" });
  });

  it("renders distance-sorted restaurants with nearby distance", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      loading: false,
      activeList: [
        {
          location_id: 7,
          distance_meters: 3218.68,
          restaurant: {
            id: "r2",
            name: "Sushi Bay",
            cuisine_type: "Japanese",
            image_url: "https://example.com/sushi.jpg",
            preview_images: null,
          },
        },
      ],
      sortMode: "distance",
      restaurantDistances: new Map(),
    });

    const { getByText } = render(<RestaurantList />);
    expect(getByText("Sushi Bay")).toBeTruthy();
    expect(getByText("2.0 mi")).toBeTruthy();
  });
});
