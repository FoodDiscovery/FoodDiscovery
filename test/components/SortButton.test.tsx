import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import SortButton from "../../src/components/home/SortButton";
import { useHome } from "../../src/Providers/HomeProvider";

jest.mock("../../src/Providers/HomeProvider", () => ({
  useHome: jest.fn(),
}));

describe("SortButton", () => {
  it("renders name sort label and handles press", () => {
    const onPressSort = jest.fn();
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      sortMode: "name",
      onPressSort,
    });

    const { getByText } = render(<SortButton />);
    fireEvent.press(getByText("Sort: Name"));

    expect(onPressSort).toHaveBeenCalledTimes(1);
  });

  it("renders distance sort label", () => {
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      sortMode: "distance",
      onPressSort: jest.fn(),
    });

    const { getByText } = render(<SortButton />);
    expect(getByText("Sort: Distance")).toBeTruthy();
  });
});
