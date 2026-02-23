import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import RestaurantCard from "../../../src/components/home/RestaurantCard";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("RestaurantCard", () => {
  it("renders fallback name and no cuisine tag when cuisine is missing", () => {
    const { getByText, queryByText } = render(
      <RestaurantCard
        id="r1"
        name={null}
        cuisineType={null}
        imageUrl={null}
        distance="1.2 mi"
      />
    );

    expect(getByText("Unnamed restaurant")).toBeTruthy();
    expect(getByText("1.2 mi")).toBeTruthy();
    expect(queryByText("#Italian →")).toBeNull();
  });

  it("renders cuisine tag and navigates to restaurant details on press", () => {
    const { getByText } = render(
      <RestaurantCard
        id="r2"
        name="Luigi's"
        cuisineType="Italian"
        imageUrl="https://example.com/restaurant.jpg"
      />
    );

    fireEvent.press(getByText("Luigi's"));

    expect(getByText("#Italian →")).toBeTruthy();
    expect(router.push).toHaveBeenCalledWith("/restaurant/r2");
  });
});
