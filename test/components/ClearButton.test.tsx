import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ClearButton from "../../src/components/home/ClearButton";
import { useHome } from "../../src/Providers/HomeProvider";

jest.mock("../../src/Providers/HomeProvider", () => ({
  useHome: jest.fn(),
}));

describe("ClearButton", () => {
  it("does not render when there is nothing to clear", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      query: "   ",
      selectedCuisines: [],
    });

    const { queryByText } = render(<ClearButton />);
    expect(queryByText("Clear")).toBeNull();
  });

  it("clears query and cuisines when pressed", () => {
    const setQuery = jest.fn();
    const setSelectedCuisines = jest.fn();
    const mockUseHome = useHome as jest.Mock;

    mockUseHome.mockReturnValue({
      query: "pizza",
      selectedCuisines: ["Italian"],
      setQuery,
      setSelectedCuisines,
    });

    const { getByText } = render(<ClearButton />);
    fireEvent.press(getByText("Clear"));

    expect(setQuery).toHaveBeenCalledWith("");
    expect(setSelectedCuisines).toHaveBeenCalledWith([]);
  });
});
