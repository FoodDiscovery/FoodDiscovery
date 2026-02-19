import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import BusinessHoursEditor from "../../src/components/BusinessHoursEditor";
import {
  createDefaultBusinessHours,
  type WeeklyBusinessHours,
} from "../../src/lib/businessHours";

describe("BusinessHoursEditor", () => {
  const defaultHours = createDefaultBusinessHours();

  it("renders all days with Open/Closed toggle", () => {
    const onChange = jest.fn();
    const { getByText, getAllByText } = render(
      <BusinessHoursEditor value={defaultHours} onChange={onChange} />
    );

    expect(getByText("Monday")).toBeTruthy();
    expect(getByText("Tuesday")).toBeTruthy();
    expect(getByText("Sunday")).toBeTruthy();
    expect(getAllByText("Open").length).toBeGreaterThan(0);
  });

  it("calls onChange with closed true when Open toggle is pressed", () => {
    const onChange = jest.fn();
    const { getAllByText } = render(
      <BusinessHoursEditor value={defaultHours} onChange={onChange} />
    );

    const firstOpenToggle = getAllByText("Open")[0];
    fireEvent.press(firstOpenToggle);

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as WeeklyBusinessHours;
    expect(next.monday.closed).toBe(true);
  });

  it("updates open hour when typing in Open hour input", () => {
    const onChange = jest.fn();
    const { getAllByDisplayValue } = render(
      <BusinessHoursEditor value={defaultHours} onChange={onChange} />
    );

    const hourInputs = getAllByDisplayValue("9");
    fireEvent.changeText(hourInputs[0], "10");

    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0] as WeeklyBusinessHours;
    expect(next.monday.open.hour).toBe(10);
  });

  it("renders Closed state and shows Closed toggle", () => {
    const closedMonday: WeeklyBusinessHours = {
      ...defaultHours,
      monday: { ...defaultHours.monday, closed: true },
    };
    const { getByText, getAllByText } = render(
      <BusinessHoursEditor value={closedMonday} onChange={jest.fn()} />
    );

    expect(getByText("Monday")).toBeTruthy();
    const closedButtons = getAllByText("Closed");
    expect(closedButtons.length).toBeGreaterThan(0);
  });
});
