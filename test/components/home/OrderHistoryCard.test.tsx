import { render } from "@testing-library/react-native";
import OrderHistoryCard, { type OrderHistoryItem } from "../../../src/components/home/OrderHistoryCard";
import { totalWithTax } from "../../../src/lib/taxConstants";

describe("OrderHistoryCard", () => {
  it("renders order id, date, item count, and price", () => {
    const order: OrderHistoryItem = {
      id: "abc12345",
      date: "02/23/2026",
      itemCount: 2,
      totalPrice: 18.66,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("Order ID: abc12345")).toBeTruthy();
    expect(getByText("02/23/2026")).toBeTruthy();
    expect(getByText("2 items")).toBeTruthy();
    expect(getByText(`$${totalWithTax(18.66).toFixed(2)}`)).toBeTruthy();
  });

  it("shows orderNumber when present (from orders.order_number)", () => {
    const order: OrderHistoryItem = {
      id: "uuid-xyz",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 10.0,
      orderNumber: 42,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("Order ID: 42")).toBeTruthy();
  });

  it("shows displayNumber when orderNumber is absent", () => {
    const order: OrderHistoryItem = {
      id: "uuid-xyz",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 10.0,
    };
    const { getByText } = render(<OrderHistoryCard order={order} displayNumber={3} />);
    expect(getByText("Order ID: 3")).toBeTruthy();
  });

  it("shortens long order id with ellipsis", () => {
    const order: OrderHistoryItem = {
      id: "bf0424b3-6542-4e47-a63c-b317268ffb5f",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 8.5,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("Order ID: bf0424b3...")).toBeTruthy();
  });

  it("shows singular item when itemCount is 1", () => {
    const order: OrderHistoryItem = {
      id: "ord-1",
      date: "01/15/2026",
      itemCount: 1,
      totalPrice: 10.0,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("1 item")).toBeTruthy();
  });

  it("shows em dash when itemCount is undefined", () => {
    const order: OrderHistoryItem = {
      id: "ord-2",
      date: "01/16/2026",
      totalPrice: 25.0,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("—")).toBeTruthy();
    expect(getByText(`$${totalWithTax(25).toFixed(2)}`)).toBeTruthy();
  });

  it("converts ISO date to MM/DD/YYYY", () => {
    const order: OrderHistoryItem = {
      id: "ord-3",
      date: "2026-03-10",
      itemCount: 3,
      totalPrice: 42.0,
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("03/10/2026")).toBeTruthy();
  });

  describe("status display", () => {
    it.each([
      { status: "confirmed", expectedDisplay: "confirmed" },
      { status: "ready", expectedDisplay: "ready" },
      { status: "completed", expectedDisplay: "completed" },
      { status: "unknown_status", expectedDisplay: "unknown_status" },
      { status: "CONFIRMED", expectedDisplay: "confirmed" },
    ])("displays status '$status' as '$expectedDisplay'", ({ status, expectedDisplay }) => {
      const order: OrderHistoryItem = {
        id: "ord-test",
        date: "02/23/2026",
        itemCount: 1,
        totalPrice: 6.0,
        status,
      };
      const { getByText } = render(<OrderHistoryCard order={order} />);
      expect(getByText(expectedDisplay)).toBeTruthy();
    });

    it("does not show status text when status is undefined", () => {
      const order: OrderHistoryItem = {
        id: "ord-f",
        date: "02/23/2026",
        itemCount: 1,
        totalPrice: 6.0,
      };
      const { queryByText } = render(<OrderHistoryCard order={order} />);
      expect(queryByText("confirmed")).toBeNull();
      expect(queryByText("ready")).toBeNull();
      expect(queryByText("completed")).toBeNull();
    });
  });
});
