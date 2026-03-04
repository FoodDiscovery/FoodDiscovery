import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import OrderDetailCacheProvider, {
  type OrderDetailData,
  useOrderDetailCache,
} from "../../src/Providers/OrderDetailCacheProvider";
import { formatIsoToPstDisplay } from "../../src/lib/dateUtils";

const mockFrom = jest.fn();

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const SAMPLE_CACHE: OrderDetailData = {
  restaurantId: "r-1",
  restaurantName: "Sushi Bay",
  address: "123 Market St",
  lineItems: [{ quantity: 1, price_at_time_of_purchase: 12.5, name: "Roll" }],
};

function buildOrderDetailOrdersQuery(result: unknown) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const eqCustomerId = jest.fn().mockReturnValue({ maybeSingle });
  const eqId = jest.fn().mockReturnValue({ eq: eqCustomerId });
  return {
    select: jest.fn().mockReturnValue({ eq: eqId }),
  };
}

function buildRestaurantsQuery(result: unknown) {
  const single = jest.fn().mockResolvedValue(result);
  const eqId = jest.fn().mockReturnValue({ single });
  return {
    select: jest.fn().mockReturnValue({ eq: eqId }),
  };
}

function buildLocationsQuery(result: unknown) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const eqRestaurantId = jest.fn().mockReturnValue({ maybeSingle });
  return {
    select: jest.fn().mockReturnValue({ eq: eqRestaurantId }),
  };
}

function buildOrderItemsDetailQuery(result: unknown) {
  const eqOrderId = jest.fn().mockResolvedValue(result);
  return {
    select: jest.fn().mockReturnValue({ eq: eqOrderId }),
  };
}

function buildOrderListOrdersQuery(result: unknown) {
  const order = jest.fn().mockResolvedValue(result);
  const eqCustomerId = jest.fn().mockReturnValue({ order });
  return {
    select: jest.fn().mockReturnValue({ eq: eqCustomerId }),
  };
}

function buildOrderItemsListQuery(result: unknown) {
  const inOrderIds = jest.fn().mockResolvedValue(result);
  return {
    select: jest.fn().mockReturnValue({ in: inOrderIds }),
  };
}

function ProviderHarness() {
  const { getCached, setCached, fetchOrderDetail, fetchOrderList } = useOrderDetailCache();
  const [cachedValue, setCachedValue] = React.useState("unset");
  const [detailResult, setDetailResult] = React.useState("unset");
  const [listResult, setListResult] = React.useState("unset");

  return (
    <>
      <Text testID="cachedValue">{cachedValue}</Text>
      <Text testID="detailResult">{detailResult}</Text>
      <Text testID="listResult">{listResult}</Text>

      <TouchableOpacity onPress={() => setCachedValue(JSON.stringify(getCached("order-1")))}>
        <Text>Read Cache</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCached("order-1", SAMPLE_CACHE)}>
        <Text>Write Cache</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          const result = await fetchOrderDetail("order-1", "user-1");
          setDetailResult(JSON.stringify(result));
        }}
      >
        <Text>Fetch Detail</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          const result = await fetchOrderList("user-1");
          setListResult(JSON.stringify(result));
        }}
      >
        <Text>Fetch List</Text>
      </TouchableOpacity>
    </>
  );
}

describe("OrderDetailCacheProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when useOrderDetailCache is used outside provider", () => {
    function BrokenHarness() {
      useOrderDetailCache();
      return null;
    }

    expect(() => render(<BrokenHarness />)).toThrow(
      "useOrderDetailCache must be used within OrderDetailCacheProvider"
    );
  });

  it("reads null before write and returns written cache entry", async () => {
    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Read Cache"));
    await waitFor(() => {
      expect(getByTestId("cachedValue").props.children).toBe("null");
    });

    fireEvent.press(getByText("Write Cache"));
    fireEvent.press(getByText("Read Cache"));
    await waitFor(() => {
      expect(getByTestId("cachedValue").props.children).toContain('"restaurantName":"Sushi Bay"');
    });
  });

  it("returns error when order detail base query fails", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderDetailOrdersQuery({
          data: null,
          error: { message: "Order lookup failed" },
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch Detail"));
    await waitFor(() => {
      expect(getByTestId("detailResult").props.children).toBe('{"error":"Order lookup failed"}');
    });
  });

  it("returns default not-found message when order is missing", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderDetailOrdersQuery({
          data: null,
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch Detail"));
    await waitFor(() => {
      expect(getByTestId("detailResult").props.children).toBe('{"error":"Order not found."}');
    });
  });

  it("returns detail payload with mapped line items and fallbacks", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderDetailOrdersQuery({
          data: { restaurant_id: "r-9" },
          error: null,
        });
      }
      if (table === "restaurants") {
        return buildRestaurantsQuery({
          data: null,
          error: null,
        });
      }
      if (table === "locations") {
        return buildLocationsQuery({
          data: { address_text: null },
          error: null,
        });
      }
      if (table === "order_items") {
        return buildOrderItemsDetailQuery({
          data: [
            {
              quantity: 2,
              price_at_time_of_purchase: 8.25,
              menu_items: [{ name: "Nigiri" }],
            },
            {
              quantity: 1,
              price_at_time_of_purchase: 5.75,
              menu_items: null,
            },
          ],
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch Detail"));
    await waitFor(() => {
      const parsed = JSON.parse(String(getByTestId("detailResult").props.children)) as {
        data: OrderDetailData;
      };
      expect(parsed.data.restaurantId).toBe("r-9");
      expect(parsed.data.restaurantName).toBe("Restaurant");
      expect(parsed.data.address).toBeNull();
      expect(parsed.data.lineItems).toEqual([
        { quantity: 2, price_at_time_of_purchase: 8.25, name: "Nigiri" },
        { quantity: 1, price_at_time_of_purchase: 5.75, name: "Item" },
      ]);
    });
  });

  it("returns empty detail line items when order_items data is null", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderDetailOrdersQuery({
          data: { restaurant_id: "r-5" },
          error: null,
        });
      }
      if (table === "restaurants") {
        return buildRestaurantsQuery({
          data: { name: "Noodle House" },
          error: null,
        });
      }
      if (table === "locations") {
        return buildLocationsQuery({
          data: { address_text: "500 Main St" },
          error: null,
        });
      }
      if (table === "order_items") {
        return buildOrderItemsDetailQuery({
          data: null,
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch Detail"));
    await waitFor(() => {
      const parsed = JSON.parse(String(getByTestId("detailResult").props.children)) as {
        data: OrderDetailData;
      };
      expect(parsed.data.restaurantName).toBe("Noodle House");
      expect(parsed.data.address).toBe("500 Main St");
      expect(parsed.data.lineItems).toEqual([]);
    });
  });

  it("returns error when order list query fails", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderListOrdersQuery({
          data: null,
          error: { message: "Order list failed" },
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch List"));
    await waitFor(() => {
      expect(getByTestId("listResult").props.children).toBe('{"error":"Order list failed"}');
    });
  });

  it("returns empty list when order list query returns null data", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderListOrdersQuery({
          data: null,
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch List"));
    await waitFor(() => {
      expect(getByTestId("listResult").props.children).toBe('{"data":[]}');
    });
  });

  it("returns empty list when user has no orders", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderListOrdersQuery({
          data: [],
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch List"));
    await waitFor(() => {
      expect(getByTestId("listResult").props.children).toBe('{"data":[]}');
    });
  });

  it("returns zero item count when order item rows are null", async () => {
    const createdAt = "2026-03-04T16:00:00.000Z";

    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderListOrdersQuery({
          data: [
            {
              id: "order-x",
              restaurant_id: "r-77",
              created_at: createdAt,
              total_amount: 19.99,
              status: "completed",
              order_number: 8,
            },
          ],
          error: null,
        });
      }
      if (table === "order_items") {
        return buildOrderItemsListQuery({
          data: null,
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch List"));
    await waitFor(() => {
      const parsed = JSON.parse(String(getByTestId("listResult").props.children)) as {
        data: { itemCount: number }[];
      };
      expect(parsed.data).toHaveLength(1);
      expect(parsed.data[0].itemCount).toBe(0);
    });
  });

  it("maps order list rows with item counts and optional fields", async () => {
    const createdAtA = "2026-03-01T16:00:00.000Z";
    const createdAtB = "2026-03-02T16:00:00.000Z";

    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return buildOrderListOrdersQuery({
          data: [
            {
              id: "order-a",
              restaurant_id: "r-1",
              created_at: createdAtA,
              total_amount: 33.5,
              status: "pending",
              order_number: 42,
            },
            {
              id: "order-b",
              restaurant_id: "r-2",
              created_at: createdAtB,
              total_amount: 20,
              status: null,
              order_number: null,
            },
          ],
          error: null,
        });
      }
      if (table === "order_items") {
        return buildOrderItemsListQuery({
          data: [
            { order_id: "order-a", quantity: 2 },
            { order_id: "order-a", quantity: 1 },
          ],
          error: null,
        });
      }
      return {};
    });

    const { getByText, getByTestId } = render(
      <OrderDetailCacheProvider>
        <ProviderHarness />
      </OrderDetailCacheProvider>
    );

    fireEvent.press(getByText("Fetch List"));
    await waitFor(() => {
      const parsed = JSON.parse(String(getByTestId("listResult").props.children)) as {
        data: {
          id: string;
          restaurantId: string;
          date: string;
          createdAt: string;
          totalPrice: number;
          itemCount: number;
          status?: string;
          orderNumber?: number;
        }[];
      };

      expect(parsed.data).toHaveLength(2);
      expect(parsed.data[0]).toEqual({
        id: "order-a",
        restaurantId: "r-1",
        date: formatIsoToPstDisplay(createdAtA),
        createdAt: createdAtA,
        totalPrice: 33.5,
        itemCount: 3,
        status: "pending",
        orderNumber: 42,
      });
      expect(parsed.data[1]).toEqual({
        id: "order-b",
        restaurantId: "r-2",
        date: formatIsoToPstDisplay(createdAtB),
        createdAt: createdAtB,
        totalPrice: 20,
        itemCount: 0,
      });
    });
  });
});
