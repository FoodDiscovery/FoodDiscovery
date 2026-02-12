jest.mock("react-native/Libraries/Modal/Modal", () => {
  const ReactLib = require("react");
  const MockModal = ({ children }: { children: unknown }) =>
    ReactLib.createElement(ReactLib.Fragment, null, children);

  return {
    __esModule: true,
    default: MockModal,
  };
});
