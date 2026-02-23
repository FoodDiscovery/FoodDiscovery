import React from "react";
import { fireEvent, render, type RenderAPI } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import MenuItemCard from "../../../src/components/menu/MenuItemCard";
import type { MenuItem } from "../../../src/components/menu/types.d";

const buildItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 1,
  category_id: 10,
  name: "Spicy Ramen",
  description: "Rich broth with pork",
  price: 14.5,
  image_url: "https://example.com/ramen.jpg",
  dietary_tags: null,
  is_available: true,
  ...overrides,
});

const getQuantityControls = (screen: RenderAPI) => screen.UNSAFE_getAllByType(TouchableOpacity);

describe("MenuItemCard", () => {
  it("renders available item details and handles increment/decrement", () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    const item = buildItem();
    const screen = render(
      React.createElement(MenuItemCard, {
        item,
        quantity: 2,
        onIncrement,
        onDecrement,
      })
    );

    expect(screen.getByText("Spicy Ramen")).toBeTruthy();
    expect(screen.getByText("Rich broth with pork")).toBeTruthy();
    expect(screen.getByText("$14.50")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();

    const controls = getQuantityControls(screen);
    expect(controls).toHaveLength(2);
    fireEvent.press(controls[0]);
    fireEvent.press(controls[1]);

    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it("disables decrement at zero and increment at quantity cap", () => {
    const item = buildItem();

    const atZero = render(
      React.createElement(MenuItemCard, {
        item,
        quantity: 0,
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      })
    );
    const zeroControls = getQuantityControls(atZero);
    expect(zeroControls[0].props.disabled).toBe(true);
    expect(zeroControls[1].props.disabled).toBe(false);

    const atCap = render(
      React.createElement(MenuItemCard, {
        item,
        quantity: 20,
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      })
    );
    const capControls = getQuantityControls(atCap);
    expect(capControls[0].props.disabled).toBe(false);
    expect(capControls[1].props.disabled).toBe(true);
  });

  it("renders fallback image and unavailable state for unavailable items", () => {
    const screen = render(
      React.createElement(MenuItemCard, {
        item: buildItem({
          image_url: null,
          description: null,
          is_available: false,
        }),
        quantity: 3,
        onIncrement: jest.fn(),
        onDecrement: jest.fn(),
      })
    );

    expect(screen.getByText("📷")).toBeTruthy();
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(screen.queryByText("+")).toBeNull();
    expect(screen.queryByText("-")).toBeNull();
  });
});
