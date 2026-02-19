import React from "react";
import { Text, View } from "react-native";
import type { MenuCategory, MenuItem } from "./types.d";
import styles from "./menuViewStyles";
import MenuItemCard from "./MenuItemCard";

interface MenuCategoryCardProps {
  category: MenuCategory;
  items: MenuItem[];
  getItemQuantity: (itemId: number) => number;
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
}

export default function MenuCategoryCard({
  category,
  items,
  getItemQuantity,
  onIncrement,
  onDecrement,
}: MenuCategoryCardProps) {
  return (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryName}>{category.name}</Text>
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          quantity={getItemQuantity(item.id)}
          onIncrement={() => onIncrement(item)}
          onDecrement={() => onDecrement(item)}
        />
      ))}
    </View>
  );
}

