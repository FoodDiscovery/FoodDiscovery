import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import styles from "./menuEditStyles";
import type { MenuCategory } from "./types";

interface Props {
  visible: boolean;
  category: MenuCategory | null; // null = creating new
  saving: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function CategoryModal({
  visible,
  category,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");

  // Reset form whenever the modal opens or the target category changes
  useEffect(() => {
    if (visible) {
      setName(category?.name ?? "");
    }
  }, [visible, category]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {category ? "Edit Category" : "New Category"}
          </Text>

          <Text style={styles.fieldLabel}>Category Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Appetizers"
            style={styles.input}
            autoFocus
          />

          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn]}
              onPress={() => onSave(name)}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
