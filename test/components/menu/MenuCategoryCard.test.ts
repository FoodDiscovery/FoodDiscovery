import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import MenuCategoryCard from "../../../src/components/menu/MenuCategoryCard";
import type { MenuCategory, MenuItem } from "../../../src/components/menu/types.d";

const category: MenuCategory = {
  id: 7,
  restaurant_id: "rest-1",
  name: "Mains",
  display_order: 1,
};

const items: MenuItem[] = [
  {
    id: 101,
    category_id: 7,
    name: "Pasta",
    description: "Creamy alfredo",
    price: 12.5,
    image_url: null,
    dietary_tags: null,
    is_available: true,
  },
  {
    id: 102,
    category_id: 7,
    name: "Burger",
    description: "Double patty",
    price: 13.25,
    image_url: null,
    dietary_tags: null,
    is_available: true,
  },
];

describe("MenuCategoryCard", () => {
  it("renders category and item cards using per-item quantities", () => {
    const getItemQuantity = jest
      .fn<number, [number]>()
      .mockImplementation((itemId) => (itemId === 101 ? 2 : 1));
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    const screen = render(
      React.createElement(MenuCategoryCard, {
        category,
        items,
        getItemQuantity,
        onIncrement,
        onDecrement,
      })
    );

    expect(screen.getByText("Mains")).toBeTruthy();
    expect(screen.getByText("Pasta")).toBeTruthy();
    expect(screen.getByText("Burger")).toBeTruthy();
    expect(getItemQuantity).toHaveBeenNthCalledWith(1, 101);
    expect(getItemQuantity).toHaveBeenNthCalledWith(2, 102);
  });

  it("forwards increment/decrement callbacks with the right item", () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    const screen = render(
      React.createElement(MenuCategoryCard, {
        category,
        items,
        getItemQuantity: () => 1,
        onIncrement,
        onDecrement,
      })
    );

    const plusButtons = screen.getAllByText("+");
    const minusButtons = screen.getAllByText("-");

    fireEvent.press(plusButtons[0]);
    fireEvent.press(plusButtons[1]);
    fireEvent.press(minusButtons[0]);
    fireEvent.press(minusButtons[1]);

    expect(onIncrement).toHaveBeenNthCalledWith(1, items[0]);
    expect(onIncrement).toHaveBeenNthCalledWith(2, items[1]);
    expect(onDecrement).toHaveBeenNthCalledWith(1, items[0]);
    expect(onDecrement).toHaveBeenNthCalledWith(2, items[1]);
  });
});
