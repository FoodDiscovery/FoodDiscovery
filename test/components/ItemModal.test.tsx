import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Switch } from "react-native";
import ItemModal from "../../src/components/menu/ItemModal";

describe("ItemModal", () => {
  it("prefills fields from an existing item", () => {
    const { getByText, getByDisplayValue, UNSAFE_getByType } = render(
      <ItemModal
        visible
        item={{
          id: 10,
          category_id: 1,
          name: "Pizza",
          description: "Classic",
          price: 12.5,
          image_url: null,
          dietary_tags: ["vegetarian", "gluten-free"],
          is_available: false,
        }}
        saving={false}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(getByText("Edit Item")).toBeTruthy();
    expect(getByDisplayValue("Pizza")).toBeTruthy();
    expect(getByDisplayValue("Classic")).toBeTruthy();
    expect(getByDisplayValue("12.5")).toBeTruthy();
    expect(getByDisplayValue("vegetarian, gluten-free")).toBeTruthy();
    expect(UNSAFE_getByType(Switch).props.value).toBe(false);
  });

  it("transforms input values and calls onSave payload", () => {
    const onSave = jest.fn();
    const { getByPlaceholderText, getByText, UNSAFE_getByType } = render(
      <ItemModal
        visible
        item={null}
        saving={false}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.changeText(
      getByPlaceholderText("e.g., Margherita Pizza"),
      "  Pasta  "
    );
    fireEvent.changeText(getByPlaceholderText("Optional description"), "   ");
    fireEvent.changeText(getByPlaceholderText("e.g., 12.99"), "15.99");
    fireEvent.changeText(
      getByPlaceholderText("e.g., vegan, gluten-free"),
      "vegan, , spicy "
    );
    fireEvent(UNSAFE_getByType(Switch), "valueChange", false);
    fireEvent.press(getByText("Save"));

    expect(onSave).toHaveBeenCalledWith({
      name: "Pasta",
      description: null,
      price: 15.99,
      dietary_tags: ["vegan", "spicy"],
      is_available: false,
    });
  });
});
