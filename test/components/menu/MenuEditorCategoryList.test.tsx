import { fireEvent, render } from "@testing-library/react-native";
import MenuEditorCategoryList from "../../../src/components/menu/MenuEditorCategoryList";
import type { MenuCategory, MenuItem } from "../../../src/components/menu/types.d";

const categories: MenuCategory[] = [
  {
    id: 1,
    restaurant_id: "rest-1",
    name: "Starters",
    display_order: 0,
  },
  {
    id: 2,
    restaurant_id: "rest-1",
    name: "Mains",
    display_order: 1,
  },
];

const itemsByCategory = new Map<number, MenuItem[]>([
  [
    1,
    [
      {
        id: 11,
        category_id: 1,
        name: "Bruschetta",
        description: null,
        price: 7.5,
        image_url: null,
        dietary_tags: null,
        is_available: true,
      },
    ],
  ],
  [
    2,
    [
      {
        id: 21,
        category_id: 2,
        name: "Lasagna",
        description: null,
        price: 15,
        image_url: null,
        dietary_tags: null,
        is_available: false,
      },
    ],
  ],
]);

describe("MenuEditorCategoryList", () => {
  it("renders categories and item details", () => {
    const screen = render(
      <MenuEditorCategoryList
        categories={categories}
        itemsByCategory={itemsByCategory}
        onEditCategory={jest.fn()}
        onMoveCategory={jest.fn()}
        onDeleteCategory={jest.fn()}
        onOpenPhoto={jest.fn()}
        onEditItem={jest.fn()}
        onDeleteItem={jest.fn()}
        onAddItem={jest.fn()}
      />
    );

    expect(screen.getByText("Starters")).toBeTruthy();
    expect(screen.getByText("Mains")).toBeTruthy();
    expect(screen.getByText("Bruschetta")).toBeTruthy();
    expect(screen.getByText("$7.50")).toBeTruthy();
    expect(screen.getByText("Lasagna")).toBeTruthy();
    expect(screen.getByText("$15.00")).toBeTruthy();
    expect(screen.getAllByText("📷")).toHaveLength(2);
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getAllByText("+ Add Item")).toHaveLength(2);
  });

  it("wires each callback to the correct payload", () => {
    const onEditCategory = jest.fn();
    const onMoveCategory = jest.fn();
    const onDeleteCategory = jest.fn();
    const onOpenPhoto = jest.fn();
    const onEditItem = jest.fn();
    const onDeleteItem = jest.fn();
    const onAddItem = jest.fn();

    const screen = render(
      <MenuEditorCategoryList
        categories={categories}
        itemsByCategory={itemsByCategory}
        onEditCategory={onEditCategory}
        onMoveCategory={onMoveCategory}
        onDeleteCategory={onDeleteCategory}
        onOpenPhoto={onOpenPhoto}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onAddItem={onAddItem}
      />
    );

    fireEvent.press(screen.getByText("Starters"));
    expect(onEditCategory).toHaveBeenCalledWith(categories[0]);

    fireEvent.press(screen.getAllByText("▼")[0]);
    expect(onMoveCategory).toHaveBeenCalledWith(1, "down");

    fireEvent.press(screen.getAllByText("▲")[1]);
    expect(onMoveCategory).toHaveBeenCalledWith(2, "up");

    const deleteButtons = screen.getAllByText("✕");
    fireEvent.press(deleteButtons[0]);
    expect(onDeleteCategory).toHaveBeenCalledWith(1);

    fireEvent.press(screen.getAllByText("📷")[0]);
    expect(onOpenPhoto).toHaveBeenCalledWith(itemsByCategory.get(1)?.[0]);

    fireEvent.press(screen.getByText("Bruschetta"));
    expect(onEditItem).toHaveBeenCalledWith(1, itemsByCategory.get(1)?.[0]);

    fireEvent.press(deleteButtons[1]);
    expect(onDeleteItem).toHaveBeenCalledWith(11);

    fireEvent.press(screen.getAllByText("+ Add Item")[1]);
    expect(onAddItem).toHaveBeenCalledWith(2);
  });
});
