import { render } from "@testing-library/react-native";
import OrderHistoryScreen from "../../../src/app/(home)/order-history";

jest.mock("../../../src/components/ProfileHeaderIcon", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe("OrderHistoryScreen", () => {
  it("renders the order history screen", () => {
    const { getByText } = render(<OrderHistoryScreen />);
    expect(getByText("Order History")).toBeTruthy();
    expect(getByText("Coming soon.")).toBeTruthy();
  });
});
