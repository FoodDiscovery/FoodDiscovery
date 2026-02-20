jest.mock("react-native/Libraries/Modal/Modal", () => {
  const mockReact = jest.requireActual("react") as typeof import("react");
  const MockModal = ({ children }: { children?: import("react").ReactNode }) =>
    mockReact.createElement(mockReact.Fragment, null, children);

  return {
    __esModule: true,
    default: MockModal,
  };
});
