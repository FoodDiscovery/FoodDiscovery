import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { menuEditStyles as styles } from "../../components/styles";
import type { MenuItem, ItemFormData } from "./types";

interface Props {
  visible: boolean;
  item: MenuItem | null; // null = creating new
  saving: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => void;
}

export default function ItemModal({
  visible,
  item,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [dietaryTags, setDietaryTags] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Reset form whenever the modal opens or the target item changes
  useEffect(() => {
    if (visible) {
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setPrice(item ? item.price.toString() : "");
      setDietaryTags((item?.dietary_tags ?? []).join(", "));
      setIsAvailable(item?.is_available ?? true);
    }
  }, [visible, item]);

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    const tags = dietaryTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      dietary_tags: tags.length > 0 ? tags : null,
      is_available: isAvailable,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { maxHeight: "85%" }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {item ? "Edit Item" : "New Item"}
            </Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Margherita Pizza"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor="#9AA0A6"
              multiline
              style={[styles.input, { minHeight: 70 }]}
            />

            <Text style={styles.fieldLabel}>Price ($)</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="e.g., 12.99"
              placeholderTextColor="#9AA0A6"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>
              Dietary Tags (comma-separated)
            </Text>
            <TextInput
              value={dietaryTags}
              onChangeText={setDietaryTags}
              placeholder="e.g., vegan, gluten-free"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Available</Text>
              <Switch value={isAvailable} onValueChange={setIsAvailable} />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
