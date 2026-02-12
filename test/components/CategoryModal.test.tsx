import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import CategoryModal from "../../src/components/menu/CategoryModal";

describe("CategoryModal", () => {
  it("renders new category mode and handles close/save actions", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <CategoryModal
        visible
        category={null}
        saving={false}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(getByText("New Category")).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText("e.g., Appetizers"), "Appetizers");
    fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Save"));
    expect(onSave).toHaveBeenCalledWith("Appetizers");
  });

  it("prefills name when editing an existing category", () => {
    const { getByDisplayValue } = render(
      <CategoryModal
        visible
        category={{
          id: 1,
          restaurant_id: "r1",
          name: "Desserts",
          display_order: 1,
        }}
        saving={false}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(getByDisplayValue("Desserts")).toBeTruthy();
  });
});
