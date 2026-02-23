import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CustomerProfileIcon from "../../src/components/CustomerProfileIcon";

// mocks cache layer
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

// image picker mocks
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

// supabase storage mocks
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

// turn picked image into arraybuffer
const mockBase64 = jest.fn();

// cache avatar url
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

// mock image picker
jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) =>
    mockRequestMediaLibraryPermissionsAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

// mock file wrapper
jest.mock("expo-file-system/next", () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: (...args: unknown[]) => mockBase64(...args),
  })),
}));

// decode base64 into arraybuffer
jest.mock("base64-arraybuffer", () => ({
  decode: () => new ArrayBuffer(8),
}));

// supabase storage
jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
      }),
    },
  },
}));

describe("CustomerProfileIcon", () => {
  // set prereqs for each test
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockRequestMediaLibraryPermissionsAsync.mockReset();
    mockLaunchImageLibraryAsync.mockReset();
    mockUpload.mockReset();
    mockGetPublicUrl.mockReset();
    mockBase64.mockReset();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it("show placeholder when no avatar is cached", async () => {
    // nothing cached, show placeholder
    mockGetItem.mockResolvedValueOnce(null);

    const screen = render(<CustomerProfileIcon userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("customer-profile-icon-placeholder")).toBeTruthy();
    });
  });

  it("show image when avatar url is cached", async () => {
    // url is cached, show image
    mockGetItem.mockResolvedValueOnce("https://cdn.example.com/avatar.jpg");

    const screen = render(<CustomerProfileIcon userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("customer-profile-icon-image")).toBeTruthy();
    });
  });

  it("uploads and stores avatar url when pressed", async () => {
    /*
    user taps icon, 
    gives permission, 
    user pickes image, 
    file is read, 
    uploaded to supabase, 
    public url is cached in cache layer, 
    image is shown
    */
    mockGetItem.mockResolvedValueOnce(null);
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: "granted" });
    mockLaunchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///avatar.png" }],
    });
    mockBase64.mockResolvedValueOnce("ZmFrZQ==");
    mockUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: { publicUrl: "https://cdn.example.com/new-avatar.png" },
    });

    const screen = render(<CustomerProfileIcon userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("customer-profile-icon")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("customer-profile-icon"));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(mockSetItem).toHaveBeenCalledWith(
        "avatar_url:user-1",
        "https://cdn.example.com/new-avatar.png"
      );
    });
  });

  it("alerts when permission is denied", async () => {
    // if permission is denied, we show an Alert and do not upload
    mockGetItem.mockResolvedValueOnce(null);
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: "denied" });

    const screen = render(<CustomerProfileIcon userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("customer-profile-icon")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("customer-profile-icon"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission needed",
        "Please allow photo library access to choose a profile image."
      );
    });
  });
});

