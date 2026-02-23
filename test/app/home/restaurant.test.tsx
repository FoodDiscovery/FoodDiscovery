import { render, waitFor } from "@testing-library/react-native";
import RestaurantMenuScreen from "../../../src/app/(home)/restaurant/[restaurantId]";

const mockFromFn = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ restaurantId: "r1" }),
}));

jest.mock("../../../src/components/ProfileHeaderIcon", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFromFn(...args),
  },
}));

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../../src/Providers/CartProvider", () => ({
  useCart: () => ({
    items: [],
    addItem: jest.fn(),
    incrementItem: jest.fn(),
    decrementItem: jest.fn(),
    itemCount: 0,
    subtotal: 0,
  }),
}));

jest.mock("../../../src/components/menu/MenuCategoryCard", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text } = jest.requireActual(
    "react-native"
  ) as typeof import("react-native");
  return {
    __esModule: true,
    default: ({ category }: { category: { name: string } }) =>
      React.createElement(Text, null, `Category: ${category.name}`),
  };
});

jest.mock("../../../src/components/menu/CartBar", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return {
    __esModule: true,
    default: () => React.createElement("View"),
  };
});

function setupMocks(opts: {
  restaurant?: Record<string, unknown>;
  categories?: Record<string, unknown>[];
  menuItems?: Record<string, unknown>[];
  profileRole?: string;
}) {
  const {
    restaurant = { id: "r1", name: "Pizza Palace", description: "Great pizza", cuisine_type: "Italian" },
    categories = [],
    menuItems = [],
    profileRole = "customer",
  } = opts;

  mockFromFn.mockImplementation((table: string) => {
    switch (table) {
      case "restaurants":
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: restaurant, error: null }),
            }),
          }),
        };
      case "menu_categories":
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: categories, error: null }),
            }),
          }),
        };
      case "profiles":
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { role: profileRole }, error: null }),
            }),
          }),
        };
      case "menu_items":
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: menuItems, error: null }),
          }),
        };
      default:
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
    }
  });
}

async function waitForMenuLoadToFinish(queryByText: (text: string) => unknown) {
  await waitFor(() => {
    expect(queryByText("Loading menu…")).toBeNull();
  });
}

describe("RestaurantMenuScreen", () => {
  const stableSession = { user: { id: "user-1", email: "test@test.com" } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ session: stableSession });
    setupMocks({});
  });

  it("shows loading indicator initially", async () => {
    const { getByText, queryByText } = render(<RestaurantMenuScreen />);
    expect(getByText("Loading menu…")).toBeTruthy();
    await waitForMenuLoadToFinish(queryByText);
  });

  it("renders restaurant name and cuisine after loading", async () => {
    const { getByText, queryByText } = render(<RestaurantMenuScreen />);

    await waitForMenuLoadToFinish(queryByText);
    expect(getByText("Italian")).toBeTruthy();
    expect(getByText("Great pizza")).toBeTruthy();
    expect(getByText("Pizza Palace")).toBeTruthy();
  });

  it("shows empty menu message when no categories exist", async () => {
    const { getByText, queryByText } = render(<RestaurantMenuScreen />);

    await waitForMenuLoadToFinish(queryByText);
    expect(getByText("No menu yet")).toBeTruthy();
  });

  it("renders menu categories", async () => {
    setupMocks({
      categories: [
        { id: 1, name: "Appetizers", restaurant_id: "r1", display_order: 0 },
        { id: 2, name: "Entrees", restaurant_id: "r1", display_order: 1 },
      ],
      menuItems: [
        { id: 10, name: "Bruschetta", category_id: 1, price: 8.0, image_url: null },
      ],
    });

    const { getByText, queryByText } = render(<RestaurantMenuScreen />);

    await waitForMenuLoadToFinish(queryByText);
    expect(getByText("Category: Appetizers")).toBeTruthy();
    expect(getByText("Category: Entrees")).toBeTruthy();
  });

  it("shows owner notice when user is an owner", async () => {
    setupMocks({ profileRole: "owner" });

    const { getByText, queryByText } = render(<RestaurantMenuScreen />);

    await waitForMenuLoadToFinish(queryByText);
    expect(getByText("Customer Menu Page")).toBeTruthy();
  });
});
