import { render } from "@testing-library/react-native";
import OrderItemRow from "../../../src/components/owner/OrderItemRow";

describe("OrderItemRow", () => {
  it("renders quantity, item name, and line total", () => {
    const { getByText } = render(
      <OrderItemRow
        quantity={2}
        itemName="Margherita Pizza"
        priceAtTimeOfPurchase={12.99}
      />
    );

    expect(getByText("2 × Margherita Pizza")).toBeTruthy();
    expect(getByText("$25.98")).toBeTruthy();
  });

  it("renders single quantity correctly", () => {
    const { getByText } = render(
      <OrderItemRow
        quantity={1}
        itemName="Caesar Salad"
        priceAtTimeOfPurchase={8.5}
      />
    );

    expect(getByText("1 × Caesar Salad")).toBeTruthy();
    expect(getByText("$8.50")).toBeTruthy();
  });
});
