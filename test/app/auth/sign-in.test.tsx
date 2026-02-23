import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignIn from "../../../src/app/(auth)/sign-in";
import { router } from "expo-router";

const mockSignInWithPassword = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}));

jest.mock("@rneui/themed", () => {
  const ReactLib = jest.requireActual("react") as typeof import("react");
  const {
    Text: RNText,
    TextInput: RNTextInput,
    TouchableOpacity: RNTouchableOpacity,
  } = jest.requireActual("react-native") as typeof import("react-native");

  return {
    Input: ({ label, ...props }: { label: string }) =>
      ReactLib.createElement(
        ReactLib.Fragment,
        null,
        ReactLib.createElement(RNText, null, label),
        ReactLib.createElement(RNTextInput, props)
      ),
    Button: ({
      title,
      onPress,
      disabled,
    }: {
      title: string;
      onPress: () => void;
      disabled?: boolean;
    }) =>
      ReactLib.createElement(
        RNTouchableOpacity,
        { onPress, disabled },
        ReactLib.createElement(RNText, null, title)
      ),
  };
});

describe("SignIn screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it("submits entered credentials to Supabase", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("email@address.com"), "owner@food.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "owner@food.com",
        password: "secret123",
      });
    });
  });

  it("alerts the user when sign-in fails", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid login credentials");
    });
  });

  it("navigates to sign-up when link is pressed", () => {
    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText("Don't have an account? Sign up"));

    expect(router.push).toHaveBeenCalledWith("/(auth)/sign-up");
  });
});
