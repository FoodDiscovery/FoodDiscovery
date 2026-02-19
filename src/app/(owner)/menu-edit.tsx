import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system/next";
import { decode } from "base64-arraybuffer";

import type { MenuCategory, MenuItem, ItemFormData } from "../../components/menu/types";
import { menuEditStyles as styles } from "../../components/styles";
import CategoryModal from "../../components/menu/CategoryModal";
import ItemModal from "../../components/menu/ItemModal";
import PhotoModal from "../../components/menu/PhotoModal";

// Screen 

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
  const [savingCategory, setSavingCategory] = useState(false);

  // Item modal
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  // Photo modal
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoItem, setPhotoItem] = useState<MenuItem | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Pre-group items by category_id for O(n) render instead of O(categories × items)
  const itemsByCategory = useMemo(() => {
    const map = new Map<number, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category_id);
      if (list) {
        list.push(item);
      } else {
        map.set(item.category_id, [item]);
      }
    }
    return map;
  }, [items]);


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

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profileErr) {
        setLoading(false);
        Alert.alert("Profile load failed", profileErr.message);
        return;
      }

      if (profile?.role !== "owner") {
        setIsOwner(false);
        setLoading(false);
        return;
      }
      setIsOwner(true);

      const { data: restaurant, error: restaurantErr } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", uid)
        .maybeSingle();

      if (restaurantErr) {
        setLoading(false);
        Alert.alert("Load failed", restaurantErr.message);
        return;
      }

      if (!restaurant) {
        setLoading(false);
        Alert.alert(
          "No restaurant",
          "Please create a restaurant first from the Edit Restaurant page."
        );
        return;
      }

      setRestaurantId(restaurant.id);
      await loadMenu(restaurant.id);
      setLoading(false);
    })();
  }, []);

  // Load categories and items
  const loadMenu = async (restId: string) => {
    const { data: cats, error: catsErr } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restId)
      .order("display_order", { ascending: true });

    if (catsErr) {
      Alert.alert("Load failed", "Could not load menu categories: " + catsErr.message);
      return;
    }

    const loadedCats = (cats ?? []) as MenuCategory[];
    setCategories(loadedCats);

    if (loadedCats.length > 0) {
      const catIds = loadedCats.map((c) => c.id);
      const { data: menuItems, error: itemsErr } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", catIds);

      if (itemsErr) {
        Alert.alert("Load failed", "Could not load menu items: " + itemsErr.message);
        return;
      }

      setItems((menuItems ?? []) as MenuItem[]);
    } else {
      setItems([]);
    }
  };

  // Category CRUD

  const openCategoryModal = (cat?: MenuCategory) => {
    setEditingCategory(cat ?? null);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async (name: string) => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a category name.");
      return;
    }
    if (!restaurantId) return;

    setSavingCategory(true);

    if (editingCategory) {
      const { error } = await supabase
        .from("menu_categories")
        .update({ name: name.trim() })
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
        name: name.trim(),
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

    // Use a temp sentinel value (-1) to avoid duplicate display_order during swap
    const tempOrder = -1;

    const { error: e1 } = await supabase
      .from("menu_categories")
      .update({ display_order: tempOrder })
      .eq("id", current.id);

    if (e1) {
      Alert.alert("Reorder failed", e1.message);
      return;
    }

    const { error: e2 } = await supabase
      .from("menu_categories")
      .update({ display_order: current.display_order })
      .eq("id", neighbor.id);

    if (e2) {
      // Attempt to restore original order for current
      await supabase
        .from("menu_categories")
        .update({ display_order: current.display_order })
        .eq("id", current.id);
      Alert.alert("Reorder failed", e2.message);
      return;
    }

    const { error: e3 } = await supabase
      .from("menu_categories")
      .update({ display_order: neighbor.display_order })
      .eq("id", current.id);

    if (e3) {
      Alert.alert("Reorder failed", e3.message);
      // Reload to reflect whatever state the DB is in
    }

    if (restaurantId) await loadMenu(restaurantId);
  };

  // Item CRUD
  const openItemModal = (categoryId: number, item?: MenuItem) => {
    setTargetCategoryId(categoryId);
    setEditingItem(item ?? null);
    setItemModalVisible(true);
  };

  const handleSaveItem = async (data: ItemFormData) => {
    if (!data.name) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }
    if (isNaN(data.price) || data.price < 0) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }
    if (!targetCategoryId) return;

    setSavingItem(true);

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(data)
        .eq("id", editingItem.id);

      if (error) {
        Alert.alert("Save failed", error.message);
        setSavingItem(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("menu_items")
        .insert({ ...data, category_id: targetCategoryId });

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

  // Photo

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
          setPhotoItem({ ...photoItem, image_url: publicUrl });
          await loadMenu(restaurantId!);
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ?? "Something went wrong uploading the photo."
      );
    }

    setUploadingPhoto(false);
  };

  // Render

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
          const catItems = itemsByCategory.get(cat.id) ?? [];

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

              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => openItemModal(cat.id)}
              >
                <Text style={styles.addItemBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>

      {/* Modals */}
      <CategoryModal
        visible={categoryModalVisible}
        category={editingCategory}
        saving={savingCategory}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
      />

      <ItemModal
        visible={itemModalVisible}
        item={editingItem}
        saving={savingItem}
        onClose={() => setItemModalVisible(false)}
        onSave={handleSaveItem}
      />

      <PhotoModal
        visible={photoModalVisible}
        item={photoItem}
        uploading={uploadingPhoto}
        onClose={() => setPhotoModalVisible(false)}
        onPickPhoto={pickAndUploadPhoto}
      />
    </KeyboardAvoidingView>
  );
}
