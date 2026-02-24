import { render } from "@testing-library/react-native";
import OrderHistoryCard, { type OrderHistoryItem } from "../../../src/components/home/OrderHistoryCard";

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
    expect(getByText("$18.66")).toBeTruthy();
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
    expect(getByText("$25.00")).toBeTruthy();
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

  it("displays status confirmed", () => {
    const order: OrderHistoryItem = {
      id: "ord-a",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 6.0,
      status: "confirmed",
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("confirmed")).toBeTruthy();
  });

  it("displays status ready", () => {
    const order: OrderHistoryItem = {
      id: "ord-b",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 6.0,
      status: "ready",
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("ready")).toBeTruthy();
  });

  it("displays status completed", () => {
    const order: OrderHistoryItem = {
      id: "ord-c",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 6.0,
      status: "completed",
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("completed")).toBeTruthy();
  });

  it("displays unknown status with default style", () => {
    const order: OrderHistoryItem = {
      id: "ord-d",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 6.0,
      status: "unknown_status",
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("unknown_status")).toBeTruthy();
  });

  it("shows status in lowercase when provided in mixed case", () => {
    const order: OrderHistoryItem = {
      id: "ord-e",
      date: "02/23/2026",
      itemCount: 1,
      totalPrice: 6.0,
      status: "CONFIRMED",
    };
    const { getByText } = render(<OrderHistoryCard order={order} />);
    expect(getByText("confirmed")).toBeTruthy();
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
