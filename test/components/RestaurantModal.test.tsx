import { fireEvent, render } from "@testing-library/react-native";
import RestaurantModal from "../../src/components/RestaurantModal";
import { createDefaultBusinessHours } from "../../src/lib/businessHours";

const baseRestaurant = {
  id: "r1",
  name: "Test Restaurant",
  description: "Description of the restaurant",
  cuisine_type: "Italian",
  image_url: null,
  business_hours: null as unknown as null,
  phone: "(408)-123-1234",
  preview_images: null,
};

describe("RestaurantModal", () => {
  it("returns null when restaurant is null", () => {
    const { toJSON } = render(
      <RestaurantModal
        visible
        restaurant={null as unknown as Parameters<typeof RestaurantModal>[0]["restaurant"]}
        onClose={jest.fn()}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders restaurant name and calls onClose when Close is pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={onClose}
      />
    );
    expect(getByText("Test Restaurant")).toBeTruthy();
    fireEvent.press(getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows distance when provided", () => {
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        distance={2.5}
        onClose={jest.fn()}
      />
    );
    expect(getByText("2.5 miles away")).toBeTruthy();
  });

  it("renders description, cuisine, and phone sections when present", () => {
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
      />
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Description of the restaurant")).toBeTruthy();
    expect(getByText("Cuisine")).toBeTruthy();
    expect(getByText("Italian")).toBeTruthy();
    expect(getByText("Phone")).toBeTruthy();
    expect(getByText("(408)-123-1234")).toBeTruthy();
  });

  it("does not render Hours section when business_hours is null", () => {
    const { queryByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
      />
    );
    expect(queryByText("Hours")).toBeNull();
  });

  it("shows Hours section with status when business_hours is weekly", () => {
    const hours = createDefaultBusinessHours();
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={{
          ...baseRestaurant,
          business_hours: hours,
        }}
        onClose={jest.fn()}
      />
    );
    expect(getByText("Hours")).toBeTruthy();
    // Display text includes day line e.g. Monday: 9:00 AM - 5:00 PM
    expect(getByText(/Monday:/)).toBeTruthy();
  });

  it("calls onViewMenu with restaurant id when View Full Menu is pressed", () => {
    const onViewMenu = jest.fn();
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
        onViewMenu={onViewMenu}
      />
    );
    fireEvent.press(getByText("View Full Menu"));
    expect(onViewMenu).toHaveBeenCalledWith("r1");
  });
});
