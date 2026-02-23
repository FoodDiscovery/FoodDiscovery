import { Image } from "react-native";
import { render } from "@testing-library/react-native";
import RestaurantImage from "../../../src/components/home/RestaurantImage";

describe("RestaurantImage", () => {
  it("renders placeholder when image url is missing", () => {
    const { getByText } = render(<RestaurantImage imageUrl={null} />);
    expect(getByText("📷")).toBeTruthy();
  });

  it("renders image when image url is provided", () => {
    const { UNSAFE_getByType } = render(
      <RestaurantImage imageUrl="https://example.com/image.jpg" />
    );

    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: "https://example.com/image.jpg" });
  });
});
