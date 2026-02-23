import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import LocationProvider, { useLocation } from "../../src/Providers/LocationProvider";
import * as ExpoLocation from "expo-location";

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockRequestForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args),
  Accuracy: { Balanced: "balanced" },
}));

function LocationHarness() {
  const { location, errorMsg, isLoading, refreshLocation } = useLocation();

  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="error">{errorMsg ?? ""}</Text>
      <Text testID="lat">{location ? String(location.latitude) : ""}</Text>
      <TouchableOpacity onPress={refreshLocation}>
        <Text>Refresh</Text>
      </TouchableOpacity>
    </>
  );
}

describe("LocationProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets an error when location permission is denied", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "denied" });

    const { getByText, getByTestId } = render(
      <LocationProvider>
        <LocationHarness />
      </LocationProvider>
    );

    fireEvent.press(getByText("Refresh"));

    await waitFor(() => {
      expect(getByTestId("error").props.children).toBe("Permission to access location was denied");
      expect(getByTestId("loading").props.children).toBe("false");
    });
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("stores coordinates when permission is granted", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 37.77, longitude: -122.42 },
    });

    const { getByText, getByTestId } = render(
      <LocationProvider>
        <LocationHarness />
      </LocationProvider>
    );

    fireEvent.press(getByText("Refresh"));

    await waitFor(() => {
      expect(getByTestId("lat").props.children).toBe("37.77");
    });
    expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
  });

  it("throws when useLocation is used outside provider", () => {
    const Broken = () => {
      useLocation();
      return null;
    };

    expect(() => render(<Broken />)).toThrow("useLocation must be used within a LocationProvider");
  });
});
