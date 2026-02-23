import { fireEvent, render } from "@testing-library/react-native";
import PhotoModal from "../../../src/components/menu/PhotoModal";

const itemWithPhoto = {
  id: 1,
  category_id: 1,
  name: "Cheese",
  description: "Classic",
  price: 12,
  image_url: "https://example.com/pizza.jpg",
  dietary_tags: [],
  is_available: true,
};

const itemNoPhoto = {
  ...itemWithPhoto,
  id: 2,
  name: "Pepperoni",
  image_url: null,
};

describe("PhotoModal", () => {
  it("renders item name and No photo yet when item has no image", () => {
    const { getByText } = render(
      <PhotoModal
        visible
        item={itemNoPhoto}
        uploading={false}
        onClose={jest.fn()}
        onPickPhoto={jest.fn()}
      />
    );
    expect(getByText("Item Photo")).toBeTruthy();
    expect(getByText("Pepperoni")).toBeTruthy();
    expect(getByText("No photo yet")).toBeTruthy();
    expect(getByText("Upload Photo")).toBeTruthy();
  });

  it("renders Change Photo when item has image_url", () => {
    const { getByText } = render(
      <PhotoModal
        visible
        item={itemWithPhoto}
        uploading={false}
        onClose={jest.fn()}
        onPickPhoto={jest.fn()}
      />
    );
    expect(getByText("Cheese")).toBeTruthy();
    expect(getByText("Change Photo")).toBeTruthy();
  });

  it("shows Uploading... and disables button when uploading", () => {
    const onPickPhoto = jest.fn();
    const { getByText } = render(
      <PhotoModal
        visible
        item={itemNoPhoto}
        uploading
        onClose={jest.fn()}
        onPickPhoto={onPickPhoto}
      />
    );
    const btn = getByText("Uploading...");
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(onPickPhoto).not.toHaveBeenCalled();
  });

  it("calls onPickPhoto when upload/change photo button is pressed", () => {
    const onPickPhoto = jest.fn();
    const { getByText } = render(
      <PhotoModal
        visible
        item={itemNoPhoto}
        uploading={false}
        onClose={jest.fn()}
        onPickPhoto={onPickPhoto}
      />
    );
    fireEvent.press(getByText("Upload Photo"));
    expect(onPickPhoto).toHaveBeenCalledTimes(1);
  });
});
