import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import MenuEditScreen from "../../../src/app/(owner)/menu-edit";

const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockStorageUpload = jest.fn();
const mockStorageGetPublicUrl = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
const mockBase64 = jest.fn();

const categories = [
  { id: 1, restaurant_id: "rest-1", name: "Starters", display_order: 0 },
  { id: 2, restaurant_id: "rest-1", name: "Mains", display_order: 1 },
];

const items = [
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
];

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) =>
    mockRequestMediaLibraryPermissionsAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

jest.mock("expo-file-system/next", () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: (...args: unknown[]) => mockBase64(...args),
  })),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: () => new ArrayBuffer(8),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockStorageUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockStorageGetPublicUrl(...args),
      }),
    },
  },
}));

jest.mock("../../../src/components/menu/CategoryModal", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text, TouchableOpacity, View } = jest.requireActual("react-native") as typeof import("react-native");
  return ({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (name: string) => void;
  }) =>
    visible
      ? React.createElement(
          View,
          null,
          React.createElement(
            TouchableOpacity,
            { onPress: () => onSave("") },
            React.createElement(Text, null, "save-category-empty")
          ),
          React.createElement(
            TouchableOpacity,
            { onPress: () => onSave("New Category") },
            React.createElement(Text, null, "save-category-valid")
          )
        )
      : null;
});

jest.mock("../../../src/components/menu/ItemModal", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text, TouchableOpacity, View } = jest.requireActual("react-native") as typeof import("react-native");
  return ({
    visible,
    onSave,
  }: {
    visible: boolean;
    onSave: (data: { name: string; description: string; price: number; is_available: boolean; dietary_tags: string[] }) => void;
  }) =>
    visible
      ? React.createElement(
          View,
          null,
          React.createElement(
            TouchableOpacity,
            {
              onPress: () =>
                onSave({
                  name: "",
                  description: "",
                  price: 9,
                  is_available: true,
                  dietary_tags: [],
                }),
            },
            React.createElement(Text, null, "save-item-empty-name")
          ),
          React.createElement(
            TouchableOpacity,
            {
              onPress: () =>
                onSave({
                  name: "Soup",
                  description: "",
                  price: -1,
                  is_available: true,
                  dietary_tags: [],
                }),
            },
            React.createElement(Text, null, "save-item-invalid-price")
          ),
          React.createElement(
            TouchableOpacity,
            {
              onPress: () =>
                onSave({
                  name: "Soup",
                  description: "",
                  price: 9,
                  is_available: true,
                  dietary_tags: [],
                }),
            },
            React.createElement(Text, null, "save-item-valid")
          )
        )
      : null;
});

jest.mock("../../../src/components/menu/PhotoModal", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text, TouchableOpacity } = jest.requireActual("react-native") as typeof import("react-native");
  return ({ visible, onPickPhoto }: { visible: boolean; onPickPhoto: () => void }) =>
    visible
      ? React.createElement(
          TouchableOpacity,
          { onPress: onPickPhoto },
          React.createElement(Text, null, "pick-photo")
        )
      : null;
});

jest.mock("../../../src/components/menu/MenuEditorCategoryList", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text, TouchableOpacity, View } = jest.requireActual("react-native") as typeof import("react-native");
  return ({
    categories: receivedCategories,
    itemsByCategory,
    onMoveCategory,
    onDeleteCategory,
    onOpenPhoto,
    onEditItem,
    onDeleteItem,
    onAddItem,
  }: {
    categories: { id: number; name: string }[];
    itemsByCategory: Map<number, { id: number }[]>;
    onMoveCategory: (id: number, direction: "up" | "down") => void;
    onDeleteCategory: (id: number) => void;
    onOpenPhoto: (item: { id: number }) => void;
    onEditItem: (categoryId: number, item: { id: number }) => void;
    onDeleteItem: (id: number) => void;
    onAddItem: (id: number) => void;
  }) => {
    const firstCategory = receivedCategories[0];
    const firstItem = firstCategory ? itemsByCategory.get(firstCategory.id)?.[0] : null;
    return React.createElement(
      View,
      null,
      React.createElement(Text, null, `mock-list-categories:${receivedCategories.length}`),
      firstCategory
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onMoveCategory(firstCategory.id, "down") },
            React.createElement(Text, null, "move-first-down")
          )
        : null,
      firstCategory
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onDeleteCategory(firstCategory.id) },
            React.createElement(Text, null, "delete-first-category")
          )
        : null,
      firstCategory
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onAddItem(firstCategory.id) },
            React.createElement(Text, null, "add-item-first-category")
          )
        : null,
      firstItem
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onOpenPhoto(firstItem) },
            React.createElement(Text, null, "open-photo-first-item")
          )
        : null,
      firstItem
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onEditItem(firstCategory.id, firstItem) },
            React.createElement(Text, null, "edit-first-item")
          )
        : null,
      firstItem
        ? React.createElement(
            TouchableOpacity,
            { onPress: () => onDeleteItem(firstItem.id) },
            React.createElement(Text, null, "delete-first-item")
          )
        : null
    );
  };
});

function selectSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectMaybeSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectEqOrder(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectIn(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue(result),
    }),
  };
}

function updateEq(result: unknown) {
  return {
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(result),
    }),
  };
}

function deleteEq(result: unknown) {
  return {
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(result),
    }),
  };
}

describe("MenuEditScreen", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockStorageUpload.mockReset();
    mockStorageGetPublicUrl.mockReset();
    mockRequestMediaLibraryPermissionsAsync.mockReset();
    mockLaunchImageLibraryAsync.mockReset();
    mockBase64.mockReset();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///menu.png" }],
    });
    mockBase64.mockResolvedValue("ZmFrZQ==");
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.example.com/item.png" },
    });
  });

  it("alerts when user is not signed in", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "missing user" } });

    render(<MenuEditScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Not signed in",
        "Please sign in to manage your menu."
      );
    });
  });

  it("shows access denied for non-owner profile", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    mockFrom.mockReturnValueOnce(selectSingle({ data: { role: "customer" }, error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("Access Denied")).toBeTruthy();
    });
  });

  it("shows no-restaurant state for owner without a restaurant", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-2" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "No restaurant",
        "Please create a restaurant first from the Edit Restaurant page."
      );
      expect(screen.getByText("No Restaurant Found")).toBeTruthy();
    });
  });

  it("loads menu data and supports category + item actions", async () => {
    const insertCategory = jest.fn().mockResolvedValue({ error: null });
    const insertItem = jest.fn().mockResolvedValue({ error: null });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-1" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce({ insert: insertCategory })
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce({ insert: insertItem })
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("Edit Menu")).toBeTruthy();
      expect(screen.getByText("mock-list-categories:2")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("+ Add Category"));
    fireEvent.press(screen.getByText("save-category-valid"));

    await waitFor(() => {
      expect(insertCategory).toHaveBeenCalledWith({
        restaurant_id: "rest-1",
        name: "New Category",
        display_order: 2,
      });
    });

    fireEvent.press(screen.getByText("add-item-first-category"));
    fireEvent.press(screen.getByText("save-item-valid"));

    await waitFor(() => {
      expect(insertItem).toHaveBeenCalledWith({
        name: "Soup",
        description: "",
        price: 9,
        is_available: true,
        dietary_tags: [],
        category_id: 1,
      });
    });
  });

  it("handles reorder, delete, and photo upload flows", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-3" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-1" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce(updateEq({ error: null }))
      .mockReturnValueOnce(updateEq({ error: null }))
      .mockReturnValueOnce(updateEq({ error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce(deleteEq({ error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce(updateEq({ error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce(deleteEq({ error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("move-first-down")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("move-first-down"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("menu_categories");
    });

    fireEvent.press(screen.getByText("delete-first-category"));
    const categoryDeleteCall = (Alert.alert as jest.Mock).mock.calls.find(
      (args) => args[0] === "Delete Category"
    );
    const categoryDeleteButtons = categoryDeleteCall?.[2] as { text: string; onPress?: () => void }[];
    categoryDeleteButtons.find((button) => button.text === "Delete")?.onPress?.();

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("menu_categories");
    });

    fireEvent.press(screen.getByText("open-photo-first-item"));
    fireEvent.press(screen.getByText("pick-photo"));

    await waitFor(() => {
      expect(mockStorageUpload).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith("menu_items");
    });

    fireEvent.press(screen.getByText("delete-first-item"));
    const itemDeleteCall = (Alert.alert as jest.Mock).mock.calls.find((args) => args[0] === "Delete Item");
    const itemDeleteButtons = itemDeleteCall?.[2] as { text: string; onPress?: () => void }[];
    itemDeleteButtons.find((button) => button.text === "Delete")?.onPress?.();

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("menu_items");
    });
  });

  it("validates category and item inputs", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-2" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-1" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("+ Add Category")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("+ Add Category"));
    fireEvent.press(screen.getByText("save-category-empty"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Missing name", "Please enter a category name.");
    });

    fireEvent.press(screen.getByText("add-item-first-category"));
    fireEvent.press(screen.getByText("save-item-empty-name"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Missing name", "Please enter an item name.");
    });

    fireEvent.press(screen.getByText("save-item-invalid-price"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Invalid price", "Please enter a valid price.");
    });
  });

  it("handles profile, restaurant, category, and item loading errors", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-e1" } }, error: null });
    mockFrom.mockReturnValueOnce(selectSingle({ data: null, error: { message: "profile bad" } }));
    render(<MenuEditScreen />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Profile load failed", "profile bad");
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-e2" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: { message: "restaurant bad" } }));
    render(<MenuEditScreen />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Load failed", "restaurant bad");
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-e3" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-err" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: null, error: { message: "cats bad" } }));
    render(<MenuEditScreen />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Load failed",
        "Could not load menu categories: cats bad"
      );
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-e4" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-err-2" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: null, error: { message: "items bad" } }));
    render(<MenuEditScreen />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Load failed", "Could not load menu items: items bad");
    });
  });

  it("shows empty state when there are no categories", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-empty" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-empty" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: [], error: null }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText('No categories yet. Tap "+ Add Category" to get started!')).toBeTruthy();
    });
  });

  it("handles category, item, and photo failure paths", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-f1" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-f1" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: { message: "cat save bad" } }) })
      .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: { message: "item save bad" } }) })
      .mockReturnValueOnce(updateEq({ error: { message: "item update bad" } }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("+ Add Category")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("+ Add Category"));
    fireEvent.press(screen.getByText("save-category-valid"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Save failed", "cat save bad");
    });

    fireEvent.press(screen.getByText("add-item-first-category"));
    fireEvent.press(screen.getByText("save-item-valid"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Save failed", "item save bad");
    });

    fireEvent.press(screen.getByText("edit-first-item"));
    fireEvent.press(screen.getByText("save-item-valid"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Save failed", "item update bad");
    });

    mockRequestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false });
    fireEvent.press(screen.getByText("open-photo-first-item"));
    fireEvent.press(screen.getByText("pick-photo"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission needed",
        "Please allow photo library access."
      );
    });
  });

  it("handles upload/update/catch photo errors and reorder/delete errors", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-f2" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: { id: "rest-f2" }, error: null }))
      .mockReturnValueOnce(selectEqOrder({ data: categories, error: null }))
      .mockReturnValueOnce(selectIn({ data: items, error: null }))
      .mockReturnValueOnce(updateEq({ error: { message: "reorder first bad" } }))
      .mockReturnValueOnce(deleteEq({ error: { message: "delete category bad" } }))
      .mockReturnValueOnce(deleteEq({ error: { message: "delete item bad" } }));

    const screen = render(<MenuEditScreen />);

    await waitFor(() => {
      expect(screen.getByText("move-first-down")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("move-first-down"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Reorder failed", "reorder first bad");
    });

    fireEvent.press(screen.getByText("delete-first-category"));
    const categoryDeleteCall = (Alert.alert as jest.Mock).mock.calls.find(
      (args) => args[0] === "Delete Category"
    );
    const categoryDeleteButtons = categoryDeleteCall?.[2] as { text: string; onPress?: () => void }[];
    categoryDeleteButtons.find((button) => button.text === "Delete")?.onPress?.();
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Delete failed", "delete category bad");
    });

    fireEvent.press(screen.getByText("delete-first-item"));
    const itemDeleteCall = (Alert.alert as jest.Mock).mock.calls.find((args) => args[0] === "Delete Item");
    const itemDeleteButtons = itemDeleteCall?.[2] as { text: string; onPress?: () => void }[];
    itemDeleteButtons.find((button) => button.text === "Delete")?.onPress?.();
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Delete failed", "delete item bad");
    });

    mockStorageUpload.mockResolvedValueOnce({ error: { message: "upload bad" } });
    fireEvent.press(screen.getByText("open-photo-first-item"));
    fireEvent.press(screen.getByText("pick-photo"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Upload failed", "upload bad");
    });

    mockStorageUpload.mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValueOnce(updateEq({ error: { message: "update image bad" } }));
    fireEvent.press(screen.getByText("open-photo-first-item"));
    fireEvent.press(screen.getByText("pick-photo"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Update failed", "update image bad");
    });

    mockBase64.mockRejectedValueOnce(new Error("base64 crash"));
    fireEvent.press(screen.getByText("open-photo-first-item"));
    fireEvent.press(screen.getByText("pick-photo"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "base64 crash");
    });
  });
});
