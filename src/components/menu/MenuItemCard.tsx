import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { MenuItem } from "./types.d";
import styles from "./menuViewStyles";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function MenuItemCard({
  item,
  quantity,
  onIncrement,
  onDecrement,
}: MenuItemCardProps) {
  return (
    <View style={styles.itemRow}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.itemThumb} />
      ) : (
        <View style={styles.itemThumbPlaceholder}>
          <Text style={{ fontSize: 18 }}>📷</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {!!item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        {!item.is_available && (
          <Text style={styles.unavailableTag}>Unavailable</Text>
        )}
      </View>

      {item.is_available ? (
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.quantityBtn,
              quantity === 0 ? styles.quantityBtnGray : styles.quantityBtnOutlined,
            ]}
            onPress={onDecrement}
            disabled={quantity === 0}
          >
            <Text
              style={[
                quantity === 0 ? styles.quantityBtnTextGray : styles.quantityBtnText,
              ]}
            >
              -
            </Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={[
              styles.quantityBtn,
              quantity >= 20 ? styles.quantityBtnGray : styles.quantityBtnOutlined,
            ]}
            onPress={onIncrement}
            disabled={quantity >= 20}
          >
            <Text
              style={[
                quantity >= 20 ? styles.quantityBtnTextGray : styles.quantityBtnText,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.unavailableTag}>Unavailable</Text>
      )}
    </View>
  );
}

