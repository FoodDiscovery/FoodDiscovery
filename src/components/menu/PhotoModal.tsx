import React from "react";
import { Modal, View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./menuEditStyles";
import type { MenuItem } from "./types";

interface Props {
  visible: boolean;
  item: MenuItem | null;
  uploading: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
}

export default function PhotoModal({
  visible,
  item,
  uploading,
  onClose,
  onPickPhoto,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Item Photo</Text>
          <Text style={[styles.subtitle, { marginBottom: 12 }]}>
            {item?.name ?? ""}
          </Text>

          {item?.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.photoPreview}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ color: "#999" }}>No photo yet</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { marginTop: 16 },
              uploading && styles.disabledBtn,
            ]}
            onPress={onPickPhoto}
            disabled={uploading}
          >
            <Text style={styles.saveBtnText}>
              {uploading
                ? "Uploading..."
                : item?.image_url
                ? "Change Photo"
                : "Upload Photo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
