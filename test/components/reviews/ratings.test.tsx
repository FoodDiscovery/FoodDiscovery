import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import Rating from "../../../src/components/reviews/ratings";

describe("Rating component", () => {
  it("renders read-only stars and label", () => {
    const { getByText, queryByLabelText, getAllByText } = render(
      <Rating value={3.4} label="Ratings: 3.4 (10)" />
    );

    expect(getByText("Ratings: 3.4 (10)")).toBeTruthy();
    expect(getAllByText("★").length).toBe(3);
    expect(getAllByText("☆").length).toBe(2);
    expect(queryByLabelText("Rate 4 stars")).toBeNull();
  });

  it("fires onChange with selected star when interactive", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<Rating value={1} onChange={onChange} />);

    fireEvent.press(getByLabelText("Rate 4 stars"));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("uses default accessibility label when one is not provided", () => {
    const { getByLabelText } = render(<Rating value={4.2} max={5} />);
    expect(getByLabelText("Rating: 4.2 out of 5 stars")).toBeTruthy();
  });

  it("uses custom accessibility label when provided", () => {
    const { getByLabelText, queryByLabelText } = render(
      <Rating value={2} accessibilityLabel="User rating widget" />
    );

    expect(getByLabelText("User rating widget")).toBeTruthy();
    expect(queryByLabelText("Rating: 2.0 out of 5 stars")).toBeNull();
  });

  it("renders custom max count in interactive mode", () => {
    const onChange = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
      <Rating value={1} max={3} onChange={onChange} />
    );

    expect(getByLabelText("Rate 3 stars")).toBeTruthy();
    expect(queryByLabelText("Rate 4 stars")).toBeNull();
  });
});
