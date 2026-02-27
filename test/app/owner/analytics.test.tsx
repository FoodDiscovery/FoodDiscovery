import { fireEvent, render, waitFor } from "@testing-library/react-native";
import OwnerAnalyticsScreen from "../../../src/app/(owner)/analytics";

const mockReplace = jest.fn();
const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const orderQueries: { gte: jest.Mock; lte: jest.Mock }[] = [];
const mockRunFocusEffect = { current: true };

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
  useFocusEffect: (fn: () => void | (() => void)) => {
    if (mockRunFocusEffect.current) {
      mockRunFocusEffect.current = false;
      fn();
    }
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../src/components/DateRangePickerModal", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Pressable, Text } = jest.requireActual("react-native") as typeof import("react-native");
  return {
    __esModule: true,
    default: ({
      onApply,
    }: {
      onApply: (selection: { startDate: string | null; endDate: string | null }) => void;
    }) =>
      React.createElement(
        Pressable,
        {
          onPress: () => onApply({ startDate: "2026-02-10", endDate: "2026-02-12" }),
        },
        React.createElement(Text, null, "mock-apply-analytics-date")
      ),
  };
});

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

function makeSingleQuery(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function makeMaybeSingleQuery(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function makeOrdersQuery(result: unknown) {
  const query: {
    eq: jest.Mock;
    order: jest.Mock;
    gte: jest.Mock;
    lte: jest.Mock;
    then?: (onFulfilled: (value: unknown) => unknown) => Promise<unknown>;
  } = {
    eq: jest.fn(),
    order: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
  };

  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  query.lte.mockReturnValue(query);
  query.then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);

  orderQueries.push(query);
  return {
    select: jest.fn().mockReturnValue(query),
  };
}

describe("OwnerAnalyticsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderQueries.length = 0;
    mockRunFocusEffect.current = true;
    mockGetUser.mockResolvedValue({
      data: { user: { id: "owner-1" } },
      error: null,
    });
  });

  it("renders completed order analytics and item frequency", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeSingleQuery({ data: { role: "owner" }, error: null });
      }
      if (table === "restaurants") {
        return makeMaybeSingleQuery({ data: { id: "rest-1" }, error: null });
      }
      return makeOrdersQuery({
        data: [
          {
            id: "order-1",
            status: "completed",
            total_amount: 12.5,
            created_at: "2026-02-11T14:00:00.000Z",
            order_items: [{ quantity: 2, menu_items: { name: "Burger" } }],
          },
          {
            id: "order-2",
            status: "completed",
            total_amount: 7.5,
            created_at: "2026-02-12T14:00:00.000Z",
            order_items: [{ quantity: 1, menu_items: { name: "Burger" } }],
          },
        ],
        error: null,
      });
    });

    const screen = render(<OwnerAnalyticsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Business Analytics")).toBeTruthy();
      expect(screen.getByText("$20.00")).toBeTruthy();
      expect(screen.getByText("Burger")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();
    });
  });

  it("applies date range filters to completed order query", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeSingleQuery({ data: { role: "owner" }, error: null });
      }
      if (table === "restaurants") {
        return makeMaybeSingleQuery({ data: { id: "rest-1" }, error: null });
      }
      return makeOrdersQuery({
        data: [],
        error: null,
      });
    });

    const screen = render(<OwnerAnalyticsScreen />);
    await waitFor(() => {
      expect(screen.getByText("Business Analytics")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("mock-apply-analytics-date"));

    await waitFor(() => {
      const latestOrdersQuery = orderQueries.at(-1);
      expect(latestOrdersQuery).toBeDefined();
      if (!latestOrdersQuery) {
        throw new Error("Orders query not captured");
      }
      expect(latestOrdersQuery.gte).toHaveBeenCalledWith(
        "created_at",
        "2026-02-10T08:00:00.000Z"
      );
      expect(latestOrdersQuery.lte).toHaveBeenCalledWith(
        "created_at",
        "2026-02-13T07:59:59.999Z"
      );
    });
  });
});
