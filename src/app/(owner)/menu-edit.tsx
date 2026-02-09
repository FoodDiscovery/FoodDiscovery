import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system/next";
import { decode } from "base64-arraybuffer";
import { router } from "expo-router";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MenuCategory {
  id: number;
  restaurant_id: string;
  name: string;
  display_order: number;
}

interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  dietary_tags: string[] | null;
  is_available: boolean;
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function MenuEditScreen() {
  // Auth / restaurant
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Menu data
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // Category modal
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Item modal
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDietaryTags, setItemDietaryTags] = useState("");
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  const [savingItem, setSavingItem] = useState(false);

  // Photo modal
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoItem, setPhotoItem] = useState<MenuItem | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Init – check owner & load restaurant                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in to manage your menu.");
        return;
      }

      const uid = userRes.user.id;
      setOwnerId(uid);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profile?.role !== "owner") {
        setIsOwner(false);
        setLoading(false);
        return;
      }
      setIsOwner(true);

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", uid)
        .maybeSingle();

      if (!restaurant) {
        setLoading(false);
        Alert.alert("No restaurant", "Please create a restaurant first from the Edit Restaurant page.");
        return;
      }

      setRestaurantId(restaurant.id);
      await loadMenu(restaurant.id);
      setLoading(false);
    })();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Load categories + items                                         */
  /* ---------------------------------------------------------------- */

  const loadMenu = async (restId: string) => {
    const { data: cats } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restId)
      .order("display_order", { ascending: true });

    const loadedCats = (cats ?? []) as MenuCategory[];
    setCategories(loadedCats);

    if (loadedCats.length > 0) {
      const catIds = loadedCats.map((c) => c.id);
      const { data: menuItems } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", catIds);

      setItems((menuItems ?? []) as MenuItem[]);
    } else {
      setItems([]);
    }
  };

  /* ================================================================ */
  /*  CATEGORY CRUD                                                    */
  /* ================================================================ */

  const openCategoryModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setCategoryModalVisible(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Missing name", "Please enter a category name.");
      return;
    }
    if (!restaurantId) return;

    setSavingCategory(true);

    if (editingCategory) {
      const { error } = await supabase
        .from("menu_categories")
        .update({ name: categoryName.trim() })
        .eq("id", editingCategory.id);

      if (error) {
        Alert.alert("Save failed", error.message);
        setSavingCategory(false);
        return;
      }
    } else {
      const maxOrder =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.display_order))
          : -1;

      const { error } = await supabase.from("menu_categories").insert({
        restaurant_id: restaurantId,
        name: categoryName.trim(),
        display_order: maxOrder + 1,
      });

      if (error) {
        Alert.alert("Save failed", error.message);
        setSavingCategory(false);
        return;
      }
    }

    setSavingCategory(false);
    setCategoryModalVisible(false);
    await loadMenu(restaurantId);
  };

  const deleteCategory = (catId: number) => {
    Alert.alert(
      "Delete Category",
      "This will also delete all items in this category. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("menu_categories")
              .delete()
              .eq("id", catId);

            if (error) {
              Alert.alert("Delete failed", error.message);
              return;
            }
            if (restaurantId) await loadMenu(restaurantId);
          },
        },
      ]
    );
  };

  const moveCategory = async (catId: number, direction: "up" | "down") => {
    const idx = categories.findIndex((c) => c.id === catId);
    if (idx < 0) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const current = categories[idx];
    const neighbor = categories[swapIdx];

    // Swap display_order values in Supabase
    const { error: e1 } = await supabase
      .from("menu_categories")
      .update({ display_order: neighbor.display_order })
      .eq("id", current.id);

    const { error: e2 } = await supabase
      .from("menu_categories")
      .update({ display_order: current.display_order })
      .eq("id", neighbor.id);

    if (e1 || e2) {
      Alert.alert("Reorder failed", (e1 || e2)!.message);
      return;
    }

    if (restaurantId) await loadMenu(restaurantId);
  };

  /* ================================================================ */
  /*  ITEM CRUD                                                        */
  /* ================================================================ */

  const openItemModal = (categoryId: number, item?: MenuItem) => {
    setTargetCategoryId(categoryId);
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemDescription(item.description ?? "");
      setItemPrice(item.price.toString());
      setItemDietaryTags((item.dietary_tags ?? []).join(", "));
      setItemIsAvailable(item.is_available);
    } else {
      setEditingItem(null);
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemDietaryTags("");
      setItemIsAvailable(true);
    }
    setItemModalVisible(true);
  };

  const saveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price < 0) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }
    if (!targetCategoryId) return;

    setSavingItem(true);

    const tags = itemDietaryTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name: itemName.trim(),
      description: itemDescription.trim() || null,
      price,
      dietary_tags: tags.length > 0 ? tags : null,
      is_available: itemIsAvailable,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingItem.id);

      if (error) {
        Alert.alert("Save failed", error.message);
        setSavingItem(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("menu_items")
        .insert({ ...payload, category_id: targetCategoryId });

      if (error) {
        Alert.alert("Save failed", error.message);
        setSavingItem(false);
        return;
      }
    }

    setSavingItem(false);
    setItemModalVisible(false);
    if (restaurantId) await loadMenu(restaurantId);
  };

  const deleteItem = (itemId: number) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("menu_items")
            .delete()
            .eq("id", itemId);

          if (error) {
            Alert.alert("Delete failed", error.message);
            return;
          }
          if (restaurantId) await loadMenu(restaurantId);
        },
      },
    ]);
  };

  /* ================================================================ */
  /*  PHOTO MODAL                                                      */
  /* ================================================================ */

  const openPhotoModal = (item: MenuItem) => {
    setPhotoItem(item);
    setPhotoModalVisible(true);
  };

  const pickAndUploadPhoto = async () => {
    if (!photoItem || !ownerId || !restaurantId) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) return;

    setUploadingPhoto(true);

    try {
      const file = new File(asset.uri);
      const base64 = await file.base64();
      const arrayBuffer = decode(base64);

      const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
      const path = `${ownerId}/${restaurantId}/menu/${photoItem.id}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("restaurant-images")
        .upload(path, arrayBuffer, { contentType, upsert: true });

      if (uploadErr) {
        Alert.alert("Upload failed", uploadErr.message);
        setUploadingPhoto(false);
        return;
      }

      const { data } = supabase.storage
        .from("restaurant-images")
        .getPublicUrl(path);

      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        const { error: updateErr } = await supabase
          .from("menu_items")
          .update({ image_url: publicUrl })
          .eq("id", photoItem.id);

        if (updateErr) {
          Alert.alert("Update failed", updateErr.message);
        } else {
          // Update local state so preview refreshes immediately
          setPhotoItem({ ...photoItem, image_url: publicUrl });
          if (restaurantId) await loadMenu(restaurantId);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong uploading the photo.");
    }

    setUploadingPhoto(false);
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>Access Denied</Text>
        <Text style={styles.subtitle}>
          This page is only available for business owners.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurantId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>No Restaurant Found</Text>
        <Text style={styles.subtitle}>
          Please create a restaurant profile first.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.heading}>Edit Menu</Text>
        <Text style={styles.subtitle}>
          Manage categories and items for your restaurant.
        </Text>

        {/* Add Category */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => openCategoryModal()}
        >
          <Text style={styles.primaryBtnText}>+ Add Category</Text>
        </TouchableOpacity>

        {categories.length === 0 && (
          <Text style={styles.emptyText}>
            No categories yet. Tap "+ Add Category" to get started!
          </Text>
        )}

        {/* Category list */}
        {categories.map((cat, idx) => {
          const catItems = items.filter((i) => i.category_id === cat.id);

          return (
            <View key={cat.id} style={styles.categoryCard}>
              {/* Category header row */}
              <View style={styles.categoryHeader}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openCategoryModal(cat)}
                >
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>

                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    onPress={() => moveCategory(cat.id, "up")}
                    disabled={idx === 0}
                    style={[
                      styles.arrowBtn,
                      idx === 0 && styles.disabledBtn,
                    ]}
                  >
                    <Text style={styles.arrowText}>▲</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => moveCategory(cat.id, "down")}
                    disabled={idx === categories.length - 1}
                    style={[
                      styles.arrowBtn,
                      idx === categories.length - 1 && styles.disabledBtn,
                    ]}
                  >
                    <Text style={styles.arrowText}>▼</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteCategory(cat.id)}
                    style={styles.xBtn}
                  >
                    <Text style={styles.xBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Items in this category */}
              {catItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  {/* Photo thumbnail – tap to open photo modal */}
                  <TouchableOpacity onPress={() => openPhotoModal(item)}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.itemThumb}
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Text style={{ fontSize: 18 }}>📷</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Item info – tap to open item modal */}
                  <TouchableOpacity
                    style={styles.itemInfo}
                    onPress={() => openItemModal(cat.id, item)}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                    {!item.is_available && (
                      <Text style={styles.unavailableTag}>Unavailable</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteItem(item.id)}
                    style={styles.xBtn}
                  >
                    <Text style={styles.xBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add item to this category */}
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => openItemModal(cat.id)}
              >
                <Text style={styles.addItemBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ============================================================ */}
      {/*  CATEGORY MODAL                                               */}
      {/* ============================================================ */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Edit Category" : "New Category"}
            </Text>

            <Text style={styles.fieldLabel}>Category Name</Text>
            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g., Appetizers"
              style={styles.input}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingCategory && styles.disabledBtn]}
                onPress={saveCategory}
                disabled={savingCategory}
              >
                <Text style={styles.saveBtnText}>
                  {savingCategory ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/*  ITEM MODAL                                                   */}
      {/* ============================================================ */}
      <Modal
        visible={itemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "85%" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingItem ? "Edit Item" : "New Item"}
              </Text>

              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g., Margherita Pizza"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                value={itemDescription}
                onChangeText={setItemDescription}
                placeholder="Optional description"
                multiline
                style={[styles.input, { minHeight: 70 }]}
              />

              <Text style={styles.fieldLabel}>Price ($)</Text>
              <TextInput
                value={itemPrice}
                onChangeText={setItemPrice}
                placeholder="e.g., 12.99"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>
                Dietary Tags (comma-separated)
              </Text>
              <TextInput
                value={itemDietaryTags}
                onChangeText={setItemDietaryTags}
                placeholder="e.g., vegan, gluten-free"
                style={styles.input}
              />

              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Available</Text>
                <Switch
                  value={itemIsAvailable}
                  onValueChange={setItemIsAvailable}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setItemModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, savingItem && styles.disabledBtn]}
                  onPress={saveItem}
                  disabled={savingItem}
                >
                  <Text style={styles.saveBtnText}>
                    {savingItem ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/*  PHOTO MODAL                                                  */}
      {/* ============================================================ */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Item Photo</Text>
            <Text style={[styles.subtitle, { marginBottom: 12 }]}>
              {photoItem?.name ?? ""}
            </Text>

            {photoItem?.image_url ? (
              <Image
                source={{ uri: photoItem.image_url }}
                style={styles.photoPreview}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={{ color: "#999" }}>No photo yet</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: 16 }, uploadingPhoto && styles.disabledBtn]}
              onPress={pickAndUploadPhoto}
              disabled={uploadingPhoto}
            >
              <Text style={styles.saveBtnText}>
                {uploadingPhoto
                  ? "Uploading..."
                  : photoItem?.image_url
                  ? "Change Photo"
                  : "Upload Photo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { marginTop: 10 }]}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ==================================================================== */
/*  Styles                                                               */
/* ==================================================================== */

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  page: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 50,
    gap: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: 20,
    fontSize: 14,
  },

  /* Primary action button */
  primaryBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* Category card */
  categoryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: "#fafafa",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "600",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 6,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#e8e8e8",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 14,
  },
  xBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#ffe0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  xBtnText: {
    fontSize: 14,
    color: "#cc0000",
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.35,
  },

  /* Item row */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 13,
    color: "#555",
  },
  unavailableTag: {
    fontSize: 11,
    color: "#cc0000",
    fontWeight: "600",
    marginTop: 2,
  },

  addItemBtn: {
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  addItemBtnText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },

  /* Back link */
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },

  /* Modal shared */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#e8e8e8",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  /* Photo modal */
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#eee",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
});
