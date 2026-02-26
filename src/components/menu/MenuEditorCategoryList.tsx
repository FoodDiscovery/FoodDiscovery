import { Image, Text, TouchableOpacity, View } from "react-native";
import { menuEditStyles as styles } from "../../components/styles";
import { sharedStyles } from "../styles";
import type { MenuCategory, MenuItem } from "./types";

interface MenuEditorCategoryListProps {
  categories: MenuCategory[];
  itemsByCategory: Map<number, MenuItem[]>;
  onEditCategory: (category: MenuCategory) => void;
  onMoveCategory: (categoryId: number, direction: "up" | "down") => void;
  onDeleteCategory: (categoryId: number) => void;
  onOpenPhoto: (item: MenuItem) => void;
  onEditItem: (categoryId: number, item: MenuItem) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: (categoryId: number) => void;
}

export default function MenuEditorCategoryList({
  categories,
  itemsByCategory,
  onEditCategory,
  onMoveCategory,
  onDeleteCategory,
  onOpenPhoto,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: MenuEditorCategoryListProps) {
  return (
    <>
      {categories.map((cat, idx) => {
        const catItems = itemsByCategory.get(cat.id) ?? [];

        return (
          <View key={cat.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity style={sharedStyles.flex1} onPress={() => onEditCategory(cat)}>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>

              <View style={styles.categoryActions}>
                <TouchableOpacity
                  onPress={() => onMoveCategory(cat.id, "up")}
                  disabled={idx === 0}
                  style={[styles.arrowBtn, idx === 0 && styles.disabledBtn]}
                >
                  <Text style={styles.arrowText}>▲</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onMoveCategory(cat.id, "down")}
                  disabled={idx === categories.length - 1}
                  style={[
                    styles.arrowBtn,
                    idx === categories.length - 1 && styles.disabledBtn,
                  ]}
                >
                  <Text style={styles.arrowText}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onDeleteCategory(cat.id)} style={styles.xBtn}>
                  <Text style={styles.xBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {catItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <TouchableOpacity onPress={() => onOpenPhoto(item)}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.itemThumb} />
                  ) : (
                    <View style={styles.itemThumbPlaceholder}>
                      <Text style={sharedStyles.emojiIcon}>📷</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.itemInfo} onPress={() => onEditItem(cat.id, item)}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {!item.is_available && (
                    <Text style={styles.unavailableTag}>Unavailable</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onDeleteItem(item.id)} style={styles.xBtn}>
                  <Text style={styles.xBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addItemBtn} onPress={() => onAddItem(cat.id)}>
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}
