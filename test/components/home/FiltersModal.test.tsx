import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FiltersModal from "../../../src/components/home/FiltersModal";
import { useHome } from "../../../src/Providers/HomeProvider";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock("../../../src/Providers/HomeProvider", () => ({
  useHome: jest.fn(),
}));

describe("FiltersModal", () => {
  it("shows empty cuisine state and closes modal with Done", () => {
    const setFiltersOpen = jest.fn();
    const mockUseSafeAreaInsets = useSafeAreaInsets as jest.Mock;
    const mockUseHome = useHome as jest.Mock;

    mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    mockUseHome.mockReturnValue({
      filtersOpen: true,
      setFiltersOpen,
      cuisineOptions: [],
      selectedCuisines: [],
      toggleCuisine: jest.fn(),
    });

    const { getByText } = render(<FiltersModal />);
    expect(getByText("No cuisine types found yet.")).toBeTruthy();

    fireEvent.press(getByText("Done"));
    expect(setFiltersOpen).toHaveBeenCalledWith(false);
  });

  it("renders cuisine options and toggles a cuisine chip", () => {
    const toggleCuisine = jest.fn();
    const mockUseSafeAreaInsets = useSafeAreaInsets as jest.Mock;
    const mockUseHome = useHome as jest.Mock;

    mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 8, left: 0, right: 0 });
    mockUseHome.mockReturnValue({
      filtersOpen: true,
      setFiltersOpen: jest.fn(),
      cuisineOptions: ["Italian", "Mexican"],
      selectedCuisines: ["Italian"],
      toggleCuisine,
    });

    const { getByText } = render(<FiltersModal />);
    fireEvent.press(getByText("Mexican"));

    expect(toggleCuisine).toHaveBeenCalledWith("Mexican");
  });
});
