import { render } from "@testing-library/react-native";
import OrderHistoryScreen from "../../../src/app/(home)/order-history";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../src/components/home/OrderHistoryList", () => ({
  __esModule: true,
  default: () => null,
}));

describe("OrderHistoryScreen", () => {
  it("renders order history screen with title", () => {
    const { getByText } = render(<OrderHistoryScreen />);
    expect(getByText("Order History")).toBeTruthy();
  });
});
