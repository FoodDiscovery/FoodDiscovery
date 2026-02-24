import { render } from "@testing-library/react-native";
import RestaurantImage from "../../../src/components/home/RestaurantImage";

describe("RestaurantImage", () => {
  it("renders placeholder when image url is missing", () => {
    const { getByText } = render(<RestaurantImage imageUrl={null} />);
    expect(getByText("📷")).toBeTruthy();
  });

  it("renders image when url is provided (no placeholder)", () => {
    const { queryByText } = render(
      <RestaurantImage imageUrl="https://example.com/image.jpg" />
    );
    expect(queryByText("📷")).toBeNull();
  });
});
