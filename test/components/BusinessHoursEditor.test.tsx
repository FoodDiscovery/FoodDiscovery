import { fireEvent, render } from "@testing-library/react-native";
import BusinessHoursEditor from "../../src/components/BusinessHoursEditor";
import {
  businessHoursToDisplayText,
  createDefaultBusinessHours,
  getRestaurantOpenStatus,
  normalizeMinuteInput,
  normalizeWeeklyBusinessHours,
  validateWeeklyBusinessHours,
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

  it("updates open minute, close hour/minute, and period toggles", () => {
    const onChange = jest.fn();
    const { getAllByDisplayValue, getAllByText } = render(
      <BusinessHoursEditor value={defaultHours} onChange={onChange} />
    );

    const minuteInputs = getAllByDisplayValue("00");
    fireEvent.changeText(minuteInputs[0], "34");
    let next = onChange.mock.calls.at(-1)?.[0] as WeeklyBusinessHours;
    expect(next.monday.open.minute).toBe(34);

    fireEvent.changeText(minuteInputs[1], "61");
    next = onChange.mock.calls.at(-1)?.[0] as WeeklyBusinessHours;
    expect(next.monday.close.minute).toBe(59);

    const closeHourInputs = getAllByDisplayValue("5");
    fireEvent.changeText(closeHourInputs[0], "0");
    next = onChange.mock.calls.at(-1)?.[0] as WeeklyBusinessHours;
    expect(next.monday.close.hour).toBe(1);

    fireEvent.press(getAllByText("PM")[0]);
    next = onChange.mock.calls.at(-1)?.[0] as WeeklyBusinessHours;
    expect(next.monday.open.period).toBe("PM");

    fireEvent.press(getAllByText("AM")[1]);
    next = onChange.mock.calls.at(-1)?.[0] as WeeklyBusinessHours;
    expect(next.monday.close.period).toBe("AM");
  });
});

describe("businessHours utilities", () => {
  it("normalizes minute input edge cases", () => {
    expect(normalizeMinuteInput("")).toBe(0);
    expect(normalizeMinuteInput("-1")).toBe(1);
    expect(normalizeMinuteInput("99")).toBe(59);
    expect(normalizeMinuteInput("07")).toBe(7);
  });

  it("validates weekly ranges and reports invalid day label", () => {
    const hours = createDefaultBusinessHours();
    hours.wednesday.open = { hour: 6, minute: 0, period: "PM" };
    hours.wednesday.close = { hour: 5, minute: 0, period: "PM" };

    expect(validateWeeklyBusinessHours(hours)).toBe(
      "Wednesday opening time must be earlier than closing time."
    );
  });

  it("returns null for a fully valid weekly schedule", () => {
    const hours = createDefaultBusinessHours();
    expect(validateWeeklyBusinessHours(hours)).toBeNull();
  });

  it("formats closed day in display text", () => {
    const hours = createDefaultBusinessHours();
    hours.sunday.closed = true;

    expect(businessHoursToDisplayText(hours)).toContain("Sunday: Closed");
  });

  it("returns closed today when current day is marked closed", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 0, 6, 10, 0, 0)); // Monday local time

    const hours = createDefaultBusinessHours();
    hours.monday.closed = true;

    expect(getRestaurantOpenStatus(hours)).toEqual({
      isOpen: false,
      statusText: "Closed today",
    });

    jest.useRealTimers();
  });

  it("returns open now when current time is within today's hours", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 0, 6, 10, 0, 0)); // Monday 10:00 AM

    const hours = createDefaultBusinessHours();
    const status = getRestaurantOpenStatus(hours);

    expect(status).toEqual({ isOpen: true, statusText: "Open now" });
    jest.useRealTimers();
  });

  it("returns closed when current time is outside today's hours", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 0, 6, 20, 0, 0)); // Monday 8:00 PM

    const hours = createDefaultBusinessHours();
    const status = getRestaurantOpenStatus(hours);

    expect(status).toEqual({ isOpen: false, statusText: "Closed" });
    jest.useRealTimers();
  });

  it("normalizes weekly hours by returning valid input or defaults", () => {
    const valid = createDefaultBusinessHours();
    expect(normalizeWeeklyBusinessHours(valid)).toBe(valid);

    const invalid = { monday: { closed: true } };
    const normalized = normalizeWeeklyBusinessHours(invalid);
    expect(normalized).not.toBe(invalid);
    expect(normalized.monday.closed).toBe(false);
  });
});
