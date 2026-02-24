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

    expect(getByText("2 x Margherita Pizza")).toBeTruthy();
    expect(getByText("$25.98")).toBeTruthy();
  });
});
