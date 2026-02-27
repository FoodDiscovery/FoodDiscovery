import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import OwnerProfileScreen from "../../../src/app/(owner)/profile";

const mockReplace = jest.fn();
const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockStorageUpload = jest.fn();
const mockStorageGetPublicUrl = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
const mockBase64 = jest.fn();
const mockValidateWeeklyBusinessHours = jest.fn();

const DEFAULT_HOURS = {
  monday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  tuesday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  wednesday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  thursday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  friday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  saturday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
  sunday: { closed: false, open: { hour: 9, minute: 0, period: "AM" }, close: { hour: 5, minute: 0, period: "PM" } },
};

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) =>
    mockRequestMediaLibraryPermissionsAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

jest.mock("expo-file-system/next", () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: (...args: unknown[]) => mockBase64(...args),
  })),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: () => new ArrayBuffer(8),
}));

jest.mock("../../../src/components/BusinessHoursEditor", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Text, TouchableOpacity } = jest.requireActual("react-native") as typeof import("react-native");
  return ({ onChange }: { onChange: (value: unknown) => void }) =>
    React.createElement(
      TouchableOpacity,
      { onPress: () => onChange(DEFAULT_HOURS) },
      React.createElement(Text, null, "Mock Business Hours Editor")
    );
});

jest.mock("../../../src/lib/businessHours", () => {
  const actual = jest.requireActual("../../../src/lib/businessHours") as Record<string, unknown>;
  return {
    ...actual,
    createDefaultBusinessHours: () => DEFAULT_HOURS,
    normalizeWeeklyBusinessHours: () => DEFAULT_HOURS,
    validateWeeklyBusinessHours: (...args: unknown[]) => mockValidateWeeklyBusinessHours(...args),
  };
});

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockStorageUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockStorageGetPublicUrl(...args),
      }),
    },
  },
}));

function selectSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectMaybeSingle(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function selectEqResult(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(result),
    }),
  };
}

function updateEq(result: unknown, onUpdate?: (payload: unknown) => void) {
  return {
    update: jest.fn().mockImplementation((payload: unknown) => {
      onUpdate?.(payload);
      return {
        eq: jest.fn().mockResolvedValue(result),
      };
    }),
  };
}

function insertSelectSingle(result: unknown) {
  return {
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("OwnerProfileScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockSignOut.mockReset();
    mockStorageUpload.mockReset();
    mockStorageGetPublicUrl.mockReset();
    mockRequestMediaLibraryPermissionsAsync.mockReset();
    mockLaunchImageLibraryAsync.mockReset();
    mockBase64.mockReset();
    mockValidateWeeklyBusinessHours.mockReset();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockValidateWeeklyBusinessHours.mockReturnValue(null);
    mockSignOut.mockResolvedValue({ error: null });
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///mock-image.jpg" }],
    });
    mockBase64.mockResolvedValue("ZmFrZQ==");
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.example.com/new-image.jpg" },
    });
  });

  it("redirects to sign-in when no authenticated user exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no user" } });

    render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Not signed in", "Please sign in again.");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign-in");
    });
  });

  it("alerts and redirects non-owner users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null });
    mockFrom.mockReturnValueOnce(
      selectSingle({ data: { role: "customer", full_name: "Not Owner" }, error: null })
    );

    render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Not an owner",
        "This page is only for business owners."
      );
      expect(mockReplace).toHaveBeenCalledWith("/(home)/home");
    });
  });

  it("loads profile data and saves updates successfully", async () => {
    const updateRestaurantPayloads: unknown[] = [];
    const updateProfilePayloads: unknown[] = [];
    const updateLocationPayloads: unknown[] = [];

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null });
    mockFrom
      .mockReturnValueOnce(
        selectSingle({ data: { role: "owner", full_name: "Jane Owner" }, error: null })
      )
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-1",
            owner_id: "owner-1",
            name: "Cafe One",
            description: "Great food",
            cuisine_type: "Thai",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "555-1111",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(
        selectMaybeSingle({ data: { id: 88, address_text: "Old Address" }, error: null })
      )
      .mockReturnValueOnce(updateEq({ error: null }, (payload) => updateRestaurantPayloads.push(payload)))
      .mockReturnValueOnce(updateEq({ error: null }, (payload) => updateProfilePayloads.push(payload)))
      .mockReturnValueOnce(updateEq({ error: null }, (payload) => updateLocationPayloads.push(payload)));

    const screen = render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText("Owner Profile")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText("e.g., FoodDiscovery Cafe"), "Cafe Two");
    fireEvent.press(screen.getByText("Save profile"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Saved", "Business profile updated successfully.");
    });

    expect(updateRestaurantPayloads[0]).toEqual({
      name: "Cafe Two",
      description: "Great food",
      cuisine_type: "Thai",
      business_hours: DEFAULT_HOURS,
      phone: "555-1111",
      image_url: null,
    });
    expect(updateProfilePayloads[0]).toEqual({ full_name: "Jane Owner" });
    expect(updateLocationPayloads[0]).toEqual({ address_text: "Old Address" });
  });

  it("validates form, uploads image, and signs out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-9" } }, error: null });
    mockFrom
      .mockReturnValueOnce(
        selectSingle({ data: { role: "owner", full_name: "Owner Nine" }, error: null })
      )
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-9",
            owner_id: "owner-9",
            name: "Ready Eat",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));

    const screen = render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText("Owner Profile")).toBeTruthy();
    });

    mockValidateWeeklyBusinessHours.mockReturnValue("Bad hours");
    fireEvent.changeText(screen.getByPlaceholderText("e.g., FoodDiscovery Cafe"), "Ready Eat Updated");
    fireEvent.press(screen.getByText("Save profile"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Invalid business hours", "Bad hours");
    });

    fireEvent.press(screen.getByText("No Image"));

    await waitFor(() => {
      expect(mockStorageUpload).toHaveBeenCalled();
    });

    mockSignOut.mockResolvedValueOnce({ error: { message: "failed signout" } });
    fireEvent.press(screen.getByText("Sign Out"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error signing out", "failed signout");
    });
  });

  it("handles profile and restaurant load errors", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-2" } }, error: null });
    mockFrom.mockReturnValueOnce(
      selectSingle({ data: null, error: { message: "profile load broke" } })
    );

    render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "profile load broke");
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-3" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "x" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: { message: "rest load broke" } }));

    render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Failed to load restaurant", "rest load broke");
    });
  });

  it("creates a restaurant when missing and handles create failure", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-4" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "Owner" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }))
      .mockReturnValueOnce(
        insertSelectSingle({
          data: null,
          error: { message: "create failed here" },
        })
      );

    render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Create failed", "create failed here");
    });
  });

  it("creates missing location on save and handles save failures", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-5" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "Owner Five" }, error: null }))
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-5",
            owner_id: "owner-5",
            name: "Five Cafe",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: { message: "location gone" } }))
      .mockReturnValueOnce(updateEq({ error: { message: "save failed one" } }));

    const screen = render(<OwnerProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText("Owner Profile")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText("e.g., FoodDiscovery Cafe"), "Five Cafe New");
    fireEvent.press(screen.getByText("Save profile"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Save failed", "save failed one");
    });
  });

  it("shows not-ready alert and missing field validation alerts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-10" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "Guest" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: { message: "rest load failed" } }));
    const notReadyScreen = render(<OwnerProfileScreen />);
    await waitFor(() => {
      expect(notReadyScreen.getByText("Owner Profile")).toBeTruthy();
    });
    fireEvent.press(notReadyScreen.getByText("No Image"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Not ready", "Restaurant not loaded yet.");
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-11" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "" }, error: null }))
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-11",
            owner_id: "owner-11",
            name: "",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));
    const missingNameScreen = render(<OwnerProfileScreen />);
    await waitFor(() => {
      expect(missingNameScreen.getByText("Save profile")).toBeTruthy();
    });
    fireEvent.changeText(missingNameScreen.getByPlaceholderText("e.g., Ethiopian, Thai, Mexican"), "Thai");
    fireEvent.press(missingNameScreen.getByText("Save profile"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Missing name",
        "Please enter your restaurant name."
      );
    });

    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-12" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "" }, error: null }))
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-12",
            owner_id: "owner-12",
            name: "Name Exists",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));
    const missingOwnerScreen = render(<OwnerProfileScreen />);
    await waitFor(() => {
      expect(missingOwnerScreen.getByText("Save profile")).toBeTruthy();
    });
    fireEvent.changeText(
      missingOwnerScreen.getByPlaceholderText("e.g., Ethiopian, Thai, Mexican"),
      "Mexican"
    );
    fireEvent.press(missingOwnerScreen.getByText("Save profile"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Missing name", "Please enter your full name.");
    });
  });

  it("handles upload permission denied and upload errors", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-13" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "Owner 13" }, error: null }))
      .mockReturnValueOnce(
        selectMaybeSingle({
          data: {
            id: "rest-13",
            owner_id: "owner-13",
            name: "Cafe 13",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));

    const screen = render(<OwnerProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText("No Image")).toBeTruthy();
    });

    mockRequestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false });
    fireEvent.press(screen.getByText("No Image"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission needed",
        "Please allow photo library access to upload an image."
      );
    });

    mockRequestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: true });
    mockStorageUpload.mockResolvedValueOnce({ error: { message: "upload image bad" } });
    fireEvent.press(screen.getByText("No Image"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Upload failed", "upload image bad");
    });
  });

  it("creates a restaurant successfully when missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-14" } }, error: null });
    mockFrom
      .mockReturnValueOnce(selectSingle({ data: { role: "owner", full_name: "Owner 14" }, error: null }))
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }))
      .mockReturnValueOnce(
        insertSelectSingle({
          data: {
            id: "rest-14",
            owner_id: "owner-14",
            name: "",
            description: "",
            cuisine_type: "",
            image_url: "",
            business_hours: DEFAULT_HOURS,
            phone: "",
          },
          error: null,
        })
      )
      .mockReturnValueOnce(selectMaybeSingle({ data: null, error: null }));

    const screen = render(<OwnerProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText("Owner Profile")).toBeTruthy();
      expect(screen.getByText("Save profile")).toBeTruthy();
    });
  });
});
