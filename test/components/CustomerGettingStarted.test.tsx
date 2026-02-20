import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import CustomerGettingStartedScreen from "../../src/app/(onboarding)/customer-getting-started";
import { useAuth } from "../../src/Providers/AuthProvider";
import { useLocation } from "../../src/Providers/LocationProvider";
import { supabase } from "../../src/lib/supabase";
import { router } from "expo-router";

jest.mock("../../src/Providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../src/Providers/LocationProvider", () => ({
  useLocation: jest.fn(),
}));

jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("@rneui/themed", () => ({
  Input: (() => {
    const mockReact = jest.requireActual("react") as typeof import("react");
    const mockReactNative =
      jest.requireActual("react-native") as typeof import("react-native");

    return ({
      value,
      onChangeText,
      placeholder,
      label,
    }: {
      value?: string;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      label?: string;
    }) =>
      mockReact.createElement(
        mockReactNative.View,
        null,
        label ? mockReact.createElement(mockReactNative.Text, null, label) : null,
        mockReact.createElement(mockReactNative.TextInput, {
          value,
          onChangeText,
          placeholder,
        })
      );
  })(),
}));

describe("CustomerGettingStartedScreen", () => {
  it("saves customer full name and requests location", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const refreshLocation = jest.fn().mockResolvedValue(undefined);

    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: "user-123",
          email: "jane@example.com",
        },
      },
    });
    (useLocation as jest.Mock).mockReturnValue({ refreshLocation });
    (supabase.from as jest.Mock).mockReturnValue({ upsert });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <CustomerGettingStartedScreen />
    );

    fireEvent.changeText(getByPlaceholderText("e.g., Jane Smith"), "Jane Smith");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(upsert).toHaveBeenCalledTimes(1);
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-123",
        role: "customer",
        full_name: "Jane Smith",
      }),
      { onConflict: "id" }
    );

    await waitFor(() => {
      expect(queryByText("Enable Location")).toBeTruthy();
    });

    fireEvent.press(getByText("Allow Location Access"));

    await waitFor(() => {
      expect(refreshLocation).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith("/(home)/home");
    });
  });
});
