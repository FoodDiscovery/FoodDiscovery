import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignUp from "../../../src/app/(auth)/sign-up";
import { router } from "expo-router";
import { decode } from "base64-arraybuffer";
import { validateWeeklyBusinessHours } from "../../../src/lib/businessHours";

const mockSignUp = jest.fn();
const mockProfileUpsert = jest.fn();
const mockRestaurantInsertSingle = jest.fn();
const mockRestaurantUpdateEq = jest.fn();
const mockLocationInsert = jest.fn();
const mockStorageUpload = jest.fn();
const mockStorageGetPublicUrl = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
const mockFileBase64 = jest.fn();
const mockValidateWeeklyBusinessHours = validateWeeklyBusinessHours as jest.Mock;

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
    from: (table: string) => {
      if (table === "profiles") {
        return {
          upsert: (...args: unknown[]) => mockProfileUpsert(...args),
        };
      }

      if (table === "restaurants") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: (...args: unknown[]) => mockRestaurantInsertSingle(...args),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: (...args: unknown[]) => mockRestaurantUpdateEq(...args),
          }),
        };
      }

      if (table === "locations") {
        return {
          insert: (...args: unknown[]) => mockLocationInsert(...args),
        };
      }

      return {};
    },
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockStorageUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockStorageGetPublicUrl(...args),
      }),
    },
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) =>
    mockRequestMediaLibraryPermissionsAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) =>
    mockLaunchImageLibraryAsync(...args),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("expo-file-system/next", () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: (...args: unknown[]) => mockFileBase64(...args),
  })),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn(),
}));

jest.mock("../../../src/components/BusinessHoursEditor", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { TouchableOpacity, Text } = jest.requireActual(
    "react-native"
  ) as typeof import("react-native");

  return {
    __esModule: true,
    default: ({
      onChange,
    }: {
      onChange: (value: Record<string, unknown>) => void;
    }) =>
      React.createElement(
        TouchableOpacity,
        { onPress: () => onChange({ monday: { open: "09:00", close: "17:00" } }) },
        React.createElement(Text, null, "Set business hours")
      ),
  };
});

jest.mock("../../../src/lib/businessHours", () => ({
  createDefaultBusinessHours: () => ({}),
  validateWeeklyBusinessHours: jest.fn(),
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

function fillCustomerForm(getByPlaceholderText: (value: string) => unknown) {
  fireEvent.changeText(
    getByPlaceholderText("email@address.com") as never,
    "owner@test.com"
  );
  fireEvent.changeText(getByPlaceholderText("Password") as never, "secret123");
}

function fillOwnerBusinessRequiredFields(
  getByPlaceholderText: (value: string) => unknown
) {
  fireEvent.changeText(getByPlaceholderText("e.g., Jane Smith") as never, "Jane Doe");
  fireEvent.changeText(
    getByPlaceholderText("e.g., FoodDiscovery Cafe") as never,
    "My Restaurant"
  );
  fireEvent.changeText(
    getByPlaceholderText("e.g., 123 Main St, City, State") as never,
    "123 Main St"
  );
  fireEvent.changeText(
    getByPlaceholderText("e.g., (555) 123-4567") as never,
    "(555) 123-4567"
  );
  fireEvent.changeText(
    getByPlaceholderText("Tell customers about your business...") as never,
    "Family-owned neighborhood kitchen."
  );
  fireEvent.changeText(
    getByPlaceholderText("e.g., Italian, Mexican, Thai") as never,
    "Mexican"
  );
}

async function selectOwnerImage(getByText: (value: string) => unknown) {
  fireEvent.press(getByText("Select Image"));
  await waitFor(() => {
    expect(getByText("Change Image")).toBeTruthy();
  });
}

describe("SignUp screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSignUp.mockResolvedValue({
      data: {
        session: null,
        user: { id: "user-1", email: "test@test.com" },
      },
      error: null,
    });
    mockProfileUpsert.mockResolvedValue({ error: null });
    mockRestaurantInsertSingle.mockResolvedValue({
      data: { id: "rest-1" },
      error: null,
    });
    mockRestaurantUpdateEq.mockResolvedValue({ error: null });
    mockLocationInsert.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/img.jpg" },
    });
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://test-image.jpg" }],
    });
    mockFileBase64.mockResolvedValue("dGVzdA==");
    (decode as jest.Mock).mockReturnValue(new ArrayBuffer(4));
    mockValidateWeeklyBusinessHours.mockReturnValue(null);

    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  it("renders the sign-up form with role toggle", () => {
    const { getByText } = render(<SignUp />);

    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Customer")).toBeTruthy();
    expect(getByText("Business Owner")).toBeTruthy();
  });

  it("submits customer sign-up with email and password", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(
      getByPlaceholderText("email@address.com"),
      "customer@test.com"
    );
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "customer@test.com",
        password: "secret123",
        options: { data: { role: "customer" } },
      });
    });
  });

  it("alerts when sign-up returns an error", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Email already in use" },
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("email@address.com"), "a@b.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "pw");
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Sign Up Error",
        "Email already in use"
      );
    });
  });

  it("alerts when email and password are empty", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Missing Information",
        "Please enter both email and password."
      );
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows owner fields when Business Owner role is selected", () => {
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));

    expect(getByText("Full Name *")).toBeTruthy();
    expect(getByText("Business Information")).toBeTruthy();
    expect(getByText("Business Name *")).toBeTruthy();
    expect(getByText("Address *")).toBeTruthy();
    expect(getByText("Phone Number *")).toBeTruthy();
  });

  it("allows toggling back to customer role", () => {
    const { getByText, queryByText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    expect(getByText("Full Name *")).toBeTruthy();

    fireEvent.press(getByText("Customer"));
    expect(queryByText("Full Name *")).toBeNull();
  });

  it("completes owner sign-up flow and creates restaurant records", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fillCustomerForm(getByPlaceholderText);
    fillOwnerBusinessRequiredFields(getByPlaceholderText);
    fireEvent.press(getByText("Set business hours"));
    await selectOwnerImage(getByText);
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "owner@test.com",
        password: "secret123",
        options: { data: { role: "owner" } },
      });
    });

    expect(mockProfileUpsert).toHaveBeenCalledWith(
      {
        id: "user-1",
        email: "test@test.com",
        role: "owner",
        full_name: "Jane Doe",
      },
      { onConflict: "id" }
    );
    expect(mockStorageUpload).toHaveBeenCalled();
    expect(mockRestaurantUpdateEq).toHaveBeenCalledWith("id", "rest-1");
    expect(mockLocationInsert).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "Verification Required",
      "Please check your inbox for email verification!"
    );
  });

  it("alerts when media permissions are denied while selecting image", async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fireEvent.press(getByText("Select Image"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Permission needed",
        "Please allow photo library access to upload an image."
      );
    });
    expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("alerts for missing owner full name before sign-up", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fillCustomerForm(getByPlaceholderText);
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Missing Information",
        "Please enter your full name."
      );
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("alerts for invalid owner business hours", async () => {
    mockValidateWeeklyBusinessHours.mockReturnValue("Monday closing time is invalid.");
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fillCustomerForm(getByPlaceholderText);
    fillOwnerBusinessRequiredFields(getByPlaceholderText);
    await selectOwnerImage(getByText);
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Invalid Business Hours",
        "Monday closing time is invalid."
      );
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("alerts when profile upsert fails and stops owner flow", async () => {
    mockProfileUpsert.mockResolvedValue({ error: { message: "upsert failed" } });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fillCustomerForm(getByPlaceholderText);
    fillOwnerBusinessRequiredFields(getByPlaceholderText);
    await selectOwnerImage(getByText);
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Registration Error",
        "Unable to save your profile information."
      );
    });
    expect(mockRestaurantInsertSingle).not.toHaveBeenCalled();
  });

  it("alerts when restaurant creation fails and does not continue", async () => {
    mockRestaurantInsertSingle.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Business Owner"));
    fillCustomerForm(getByPlaceholderText);
    fillOwnerBusinessRequiredFields(getByPlaceholderText);
    await selectOwnerImage(getByText);
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Registration Error",
        "Failed to create your business profile. Please try again."
      );
    });
    expect(mockLocationInsert).not.toHaveBeenCalled();
  });

  it("navigates to sign-in when link is pressed", () => {
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Already have an account? Sign in"));

    expect(router.push).toHaveBeenCalledWith("/(auth)/sign-in");
  });

  it("shows verification alert when no session is returned", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(
      getByPlaceholderText("email@address.com"),
      "new@test.com"
    );
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Sign up"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Verification Required",
        "Please check your inbox for email verification!"
      );
    });
  });
});
