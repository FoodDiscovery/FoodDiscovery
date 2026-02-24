import { fireEvent, render } from "@testing-library/react-native";
import OrderCard from "../../../src/components/owner/OrderCard";

const baseOrder = {
  id: "order-1",
  status: "confirmed" as const,
  totalAmount: 25.98,
  createdAt: "2025-02-23T14:30:00Z",
  customerName: "Jane Doe",
  orderItems: [
    {
      quantity: 2,
      price_at_time_of_purchase: 12.99,
      menu_items: { name: "Margherita Pizza" },
    },
    {
      quantity: 1,
      price_at_time_of_purchase: 3.5,
      menu_items: { name: "Garlic Bread" },
    },
  ],
};

describe("OrderCard", () => {
  it("renders customer name (abbreviated), items, total, and status badge", () => {
    const { getByText, getAllByText } = render(<OrderCard {...baseOrder} />);

    expect(getByText("Jane D.")).toBeTruthy();
    expect(getByText("2 x Margherita Pizza")).toBeTruthy();
    expect(getByText("1 x Garlic Bread")).toBeTruthy();
    expect(getAllByText("$25.98").length).toBeGreaterThan(0);
    expect(getByText("Confirmed")).toBeTruthy();
  });

  it("shows Ready for pickup button when status is confirmed", () => {
    const onMarkReady = jest.fn();
    const { getByTestId } = render(
      <OrderCard {...baseOrder} onMarkReady={onMarkReady} />
    );

    fireEvent.press(getByTestId("order-order-1-mark-ready"));
    expect(onMarkReady).toHaveBeenCalledTimes(1);
  });

  it("shows Completed button when status is ready", () => {
    const onMarkCompleted = jest.fn();
    const { getByTestId } = render(
      <OrderCard
        {...baseOrder}
        status="ready"
        onMarkCompleted={onMarkCompleted}
      />
    );

    fireEvent.press(getByTestId("order-order-1-mark-completed"));
    expect(onMarkCompleted).toHaveBeenCalledTimes(1);
  });

  it("abbreviates multi-part names to first name + last initial", () => {
    const { getByText } = render(
      <OrderCard {...baseOrder} customerName="Mary Jane Watson" />
    );
    expect(getByText("Mary W.")).toBeTruthy();
  });

  it("displays single name as-is", () => {
    const { getByText } = render(
      <OrderCard {...baseOrder} customerName="Madonna" />
    );
    expect(getByText("Madonna")).toBeTruthy();
  });

  it("displays Guest when customer name is null", () => {
    const { getByText } = render(
      <OrderCard {...baseOrder} customerName={null} />
    );
    expect(getByText("Guest")).toBeTruthy();
  });

  it("handles unknown item when menu_items is null", () => {
    const { getByText } = render(
      <OrderCard
        {...baseOrder}
        orderItems={[
          {
            quantity: 1,
            price_at_time_of_purchase: 5,
            menu_items: null,
          },
        ]}
      />
    );
    expect(getByText("1 x Unknown item")).toBeTruthy();
  });

  it("disables buttons when isUpdating", () => {
    const onMarkReady = jest.fn();
    const { getByTestId } = render(
      <OrderCard
        {...baseOrder}
        onMarkReady={onMarkReady}
        isUpdating={true}
      />
    );

    const btn = getByTestId("order-order-1-mark-ready");
    fireEvent.press(btn);
    expect(onMarkReady).not.toHaveBeenCalled();
  });
});
