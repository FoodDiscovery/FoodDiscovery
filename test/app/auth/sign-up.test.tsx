import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignUp from "../../../src/app/(auth)/sign-up";
import { router } from "expo-router";

const mockSignUp = jest.fn();
const mockFrom = jest.fn();
const mockUpsert = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("expo-file-system/next", () => ({
  File: jest.fn(),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn(),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: jest.fn(),
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

describe("SignUp screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    mockSignUp.mockResolvedValue({
      data: {
        session: null,
        user: { id: "u-1", email: "new@food.com" },
      },
      error: null,
    });

    mockUpsert.mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          upsert: mockUpsert,
        };
      }
      return {};
    });
  });

  it("shows a validation alert when email or password is missing", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Sign up"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Missing Information",
      "Please enter both email and password."
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("registers a customer and saves profile metadata", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("email@address.com"), "new@food.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@food.com",
        password: "secret123",
        options: { data: { role: "customer" } },
      });
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        id: "u-1",
        email: "new@food.com",
        role: "customer",
        full_name: null,
      },
      { onConflict: "id" }
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Verification Required",
      "Please check your inbox for email verification!"
    );
  });

  it("navigates to sign-in when link is pressed", () => {
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Already have an account? Sign in"));

    expect(router.push).toHaveBeenCalledWith("/(auth)/sign-in");
  });
});
