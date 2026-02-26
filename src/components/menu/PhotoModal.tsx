import { Modal, View, Text, Image, TouchableOpacity } from "react-native";
import { menuEditStyles as styles } from "../../components/styles";
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
          <Text style={[styles.subtitle, styles.subtitleWithMargin]}>
            {item?.name ?? ""}
          </Text>

          {item?.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.photoPreview}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.noPhotoText}>No photo yet</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              styles.saveBtnSpacing,
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
            style={[styles.cancelBtn, styles.cancelBtnSpacing]}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
