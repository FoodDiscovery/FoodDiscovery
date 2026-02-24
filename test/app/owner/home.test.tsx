import { render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import OwnerHomeScreen from "../../../src/app/(owner)/home";

const mockReplace = jest.fn();
const mockFrom = jest.fn();
const mockGetUser = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

function selectEqMaybeSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectEqInOrder(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue(result),
        }),
      }),
    }),
  };
}

function selectEqSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("OwnerHomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockGetUser.mockResolvedValue({
      data: { user: { id: "owner-1" } },
      error: null,
    });
  });

  it("redirects to sign-in when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no user" } });

    render(<OwnerHomeScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Not signed in", "Please sign in again.");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign-in");
    });
  });

  it("redirects non-owners to home", async () => {
    mockFrom
      .mockReturnValueOnce(
        selectEqSingle({ data: { role: "customer" }, error: null })
      );

    render(<OwnerHomeScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Not an owner",
        "This page is only for business owners."
      );
      expect(mockReplace).toHaveBeenCalledWith("/(home)/home");
    });
  });

  it("shows empty state when owner has no restaurant", async () => {
    mockFrom
      .mockReturnValueOnce(
        selectEqSingle({ data: { role: "owner" }, error: null })
      )
      .mockReturnValueOnce(
        selectEqMaybeSingle({ data: null, error: null })
      );

    const { getByText } = render(<OwnerHomeScreen />);

    await waitFor(() => {
      expect(getByText("No incoming orders")).toBeTruthy();
      expect(getByText(/Set up your restaurant in Profile/)).toBeTruthy();
    });
  });

  it("shows incoming orders when owner has restaurant and orders", async () => {
    mockFrom
      .mockReturnValueOnce(
        selectEqSingle({ data: { role: "owner" }, error: null })
      )
      .mockReturnValueOnce(
        selectEqMaybeSingle({
          data: { id: "rest-1" },
          error: null,
        })
      )
      .mockReturnValueOnce(
        selectEqInOrder({
          data: [
            {
              id: "order-1",
              status: "confirmed",
              total_amount: 25.98,
              created_at: "2025-02-23T14:30:00Z",
              customer_id: "cust-1",
              order_items: [
                {
                  quantity: 2,
                  price_at_time_of_purchase: 12.99,
                  menu_items: { name: "Margherita Pizza" },
                },
              ],
              profiles: { full_name: "Jane Doe" },
            },
          ],
          error: null,
        })
      );

    const { getByText } = render(<OwnerHomeScreen />);

    await waitFor(() => {
      expect(getByText("Incoming Orders")).toBeTruthy();
      expect(getByText("Jane D.")).toBeTruthy();
      expect(getByText("2 × Margherita Pizza")).toBeTruthy();
      expect(getByText("Ready for pickup")).toBeTruthy();
    });
  });

  it("shows empty message when restaurant exists but no orders", async () => {
    mockFrom
      .mockReturnValueOnce(
        selectEqSingle({ data: { role: "owner" }, error: null })
      )
      .mockReturnValueOnce(
        selectEqMaybeSingle({
          data: { id: "rest-1" },
          error: null,
        })
      )
      .mockReturnValueOnce(
        selectEqInOrder({
          data: [],
          error: null,
        })
      );

    const { getByText } = render(<OwnerHomeScreen />);

    await waitFor(() => {
      expect(getByText("No incoming orders")).toBeTruthy();
      expect(getByText(/New orders will appear here/)).toBeTruthy();
    });
  });
});
