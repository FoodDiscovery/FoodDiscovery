import { fireEvent, render } from "@testing-library/react-native";
import DateRangePickerModal from "../../src/components/DateRangePickerModal";

describe("DateRangePickerModal", () => {
  it("applies a single-day selection", () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    const screen = render(
      <DateRangePickerModal
        visible
        onClose={onClose}
        onApply={onApply}
        initialStartDate="2026-02-01"
      />
    );

    fireEvent.press(screen.getByText("Clear"));
    fireEvent.press(screen.getByTestId("day-2026-02-15"));
    fireEvent.press(screen.getByText("Apply"));

    expect(onApply).toHaveBeenCalledWith({
      startDate: "2026-02-15",
      endDate: null,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows only From when one date is selected, and From | To when range is selected", () => {
    const screen = render(
      <DateRangePickerModal
        visible
        onClose={jest.fn()}
        onApply={jest.fn()}
        initialStartDate="2026-02-01"
      />
    );
    fireEvent.press(screen.getByText("Clear"));
    fireEvent.press(screen.getByTestId("day-2026-02-12"));
    expect(screen.getByText(/From: 02\/12\/2026$/)).toBeTruthy();
    expect(screen.queryByText(/To: Any/)).toBeNull();

    fireEvent.press(screen.getByTestId("day-2026-02-15"));
    expect(screen.getByText(/From: 02\/12\/2026 \| To: 02\/15\/2026/)).toBeTruthy();
  });

  it("builds a range when two dates are selected", () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    const screen = render(
      <DateRangePickerModal
        visible
        onClose={onClose}
        onApply={onApply}
        initialStartDate="2026-02-01"
        initialEndDate={null}
      />
    );

    fireEvent.press(screen.getByText("Clear"));
    fireEvent.press(screen.getByTestId("day-2026-02-10"));
    fireEvent.press(screen.getByTestId("day-2026-02-12"));
    fireEvent.press(screen.getByText("Apply"));

    expect(onApply).toHaveBeenCalledWith({
      startDate: "2026-02-10",
      endDate: "2026-02-12",
    });
  });
});
