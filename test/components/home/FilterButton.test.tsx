import { fireEvent, render } from "@testing-library/react-native";
import FilterButton from "../../../src/components/home/FilterButton";
import { useHome } from "../../../src/Providers/HomeProvider";

jest.mock("../../../src/Providers/HomeProvider", () => ({
  useHome: jest.fn(),
}));

describe("FilterButton", () => {
  it("opens filters modal when pressed", () => {
    const setFiltersOpen = jest.fn();
    const mockUseHome = useHome as jest.Mock;
    mockUseHome.mockReturnValue({
      setFiltersOpen,
    });

    const { getByText } = render(<FilterButton />);
    fireEvent.press(getByText("Filters"));

    expect(setFiltersOpen).toHaveBeenCalledWith(true);
  });
});
