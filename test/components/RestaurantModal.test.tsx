import { fireEvent, render } from "@testing-library/react-native";
import RestaurantModal from "../../src/components/RestaurantModal";
import { createDefaultBusinessHours } from "../../src/lib/businessHours";
import * as ratings from "../../src/lib/ratings";
import { useAuth } from "../../src/Providers/AuthProvider";

jest.mock("../../src/lib/ratings", () => ({
  fetchRestaurantRating: jest.fn(),
  getSavedUserRestaurantRating: jest.fn(),
}));
jest.mock("../../src/Providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockFetchRestaurantRating = jest.mocked(ratings.fetchRestaurantRating);
const mockGetSavedUserRestaurantRating = jest.mocked(ratings.getSavedUserRestaurantRating);
const mockUseAuth = jest.mocked(useAuth);

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

function buildBusinessHoursForMonday(openHour: number, closeHour: number) {
  const hours = createDefaultBusinessHours();
  hours.monday = {
    closed: false,
    open: { hour: openHour, minute: 0, period: "AM" as const },
    close: { hour: closeHour, minute: 0, period: "PM" as const },
  };
  return hours;
}

beforeEach(() => {
  mockFetchRestaurantRating.mockResolvedValue(null);
  mockGetSavedUserRestaurantRating.mockResolvedValue(null);
  mockUseAuth.mockReturnValue({ session: null });
});

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
    expect(getByText("2.5 mi away")).toBeTruthy();
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

  it("shows no preview images fallback when preview_images is empty", () => {
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={{
          ...baseRestaurant,
          preview_images: [],
        }}
        onClose={jest.fn()}
      />
    );
    expect(getByText(/No preview images/)).toBeTruthy();
  });

  it("handles rating load error gracefully", async () => {
    mockFetchRestaurantRating.mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const { getByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
      />
    );
    expect(getByText("Test Restaurant")).toBeTruthy();
    await Promise.resolve();
    consoleSpy.mockRestore();
  });

  it("displays user saved rating when logged in", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "u1" } },
    } as ReturnType<typeof useAuth>);
    mockFetchRestaurantRating.mockResolvedValue({
      restaurant_id: "r1",
      average_rating: 4.2,
      rating_count: 10,
    });
    mockGetSavedUserRestaurantRating.mockResolvedValue(4.5);
    const { findByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
      />
    );
    expect(await findByText(/Your rating: 4\.5/)).toBeTruthy();
  });

  it("displays rating summary when user is not logged in", async () => {
    mockFetchRestaurantRating.mockResolvedValue({
      restaurant_id: "r1",
      average_rating: 4.2,
      rating_count: 10,
    });
    const { findByText } = render(
      <RestaurantModal
        visible
        restaurant={baseRestaurant}
        onClose={jest.fn()}
      />
    );
    expect(await findByText(/Ratings: 4\.2 \(10\)/)).toBeTruthy();
  });

  describe("business hours rendering", () => {
    it("shows Hours section with structured weekly hours", () => {
      const { getByText } = render(
        <RestaurantModal
          visible
          restaurant={{
            ...baseRestaurant,
            business_hours: createDefaultBusinessHours(),
          }}
          onClose={jest.fn()}
        />
      );

      expect(getByText("Hours")).toBeTruthy();
      expect(getByText(/Monday:/)).toBeTruthy();
    });

    it.each([
      {
        name: "open now during weekly business hours",
        hours: buildBusinessHoursForMonday(9, 5),
        mockTime: new Date(2025, 0, 6, 10, 0, 0), // Monday 10:00 AM
        expectedStatus: "Open now",
      },
      {
        name: "closed outside business hours",
        hours: buildBusinessHoursForMonday(9, 5),
        mockTime: new Date(2025, 0, 6, 20, 0, 0), // Monday 8:00 PM
        expectedStatus: "Closed",
      },
      {
        name: "closed today when monday is marked closed",
        hours: {
          ...createDefaultBusinessHours(),
          monday: {
            closed: true,
            open: { hour: 9, minute: 0, period: "AM" as const },
            close: { hour: 5, minute: 0, period: "PM" as const },
          },
        },
        mockTime: new Date(2025, 0, 6, 10, 0, 0),
        expectedStatus: "Closed today",
      },
    ])("shows correct status: $name", ({ hours, mockTime, expectedStatus }) => {
      jest.useFakeTimers();
      jest.setSystemTime(mockTime);

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
      expect(getByText(expectedStatus)).toBeTruthy();

      jest.useRealTimers();
    });
  });
});
