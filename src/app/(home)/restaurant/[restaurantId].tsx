import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../Providers/CartProvider";
import type { MenuCategory, MenuItem } from "../../../components/menu/types";
import { menuViewStyles as styles } from "../../../components/styles";

type RestaurantSummary = {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
};

export default function RestaurantMenuScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { addItem, itemCount, subtotal } = useCart();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

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
    const loadMenuForRestaurant = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in to view restaurant menus.");
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user.id)
        .limit(1)
        .maybeSingle();

      // Continue even if profile row is missing/duplicated; treat as customer by default.
      if (profileErr) {
        console.warn("Profile load warning:", profileErr.message);
      }

      setIsOwner(profile?.role === "owner");

      const { data: restaurantData, error: restaurantErr } = await supabase
        .from("restaurants")
        .select("id,name,description,cuisine_type")
        .eq("id", restaurantId)
        .single();

      if (restaurantErr) {
        setLoading(false);
        Alert.alert("Load failed", restaurantErr.message);
        return;
      }

      setRestaurant(restaurantData as RestaurantSummary);

      const { data: cats, error: catsErr } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true });

      if (catsErr) {
        setLoading(false);
        Alert.alert("Load failed", "Could not load menu categories: " + catsErr.message);
        return;
      }

      const loadedCategories = (cats ?? []) as MenuCategory[];
      setCategories(loadedCategories);

      if (loadedCategories.length > 0) {
        const catIds = loadedCategories.map((c) => c.id);
        const { data: menuItems, error: itemsErr } = await supabase
          .from("menu_items")
          .select("*")
          .in("category_id", catIds);

        if (itemsErr) {
          setLoading(false);
          Alert.alert("Load failed", "Could not load menu items: " + itemsErr.message);
          return;
        }

        setItems((menuItems ?? []) as MenuItem[]);
      } else {
        setItems([]);
      }

      setLoading(false);
    };

    loadMenuForRestaurant();
  }, [restaurantId]);

  const onAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name ?? "Restaurant",
      itemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.image_url,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  if (isOwner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>Customer Menu Page</Text>
        <Text style={styles.subtitle}>
          This page is for customer accounts. Owners can use Edit Menu instead.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.heading}>{restaurant?.name ?? "Restaurant Menu"}</Text>
        {!!restaurant?.description && (
          <Text style={styles.subtitle}>{restaurant.description}</Text>
        )}
        {!!restaurant?.cuisine_type && (
          <View style={styles.cuisineTag}>
            <Text style={styles.cuisineTagText}>{restaurant.cuisine_type}</Text>
          </View>
        )}

        {categories.length === 0 && (
          <Text style={styles.emptyText}>
            This restaurant has not published menu categories yet.
          </Text>
        )}

        {categories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? [];
          return (
            <View key={category.id} style={styles.categoryCard}>
              <Text style={styles.categoryName}>{category.name}</Text>
              {categoryItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.itemThumb} />
                  ) : (
                    <View style={styles.itemThumbPlaceholder}>
                      <Text style={{ fontSize: 18 }}>📷</Text>
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {!!item.description && (
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    )}
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    {!item.is_available && (
                      <Text style={styles.unavailableTag}>Unavailable</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.addBtn, !item.is_available && styles.addBtnDisabled]}
                    disabled={!item.is_available}
                    onPress={() => onAddToCart(item)}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.cartBar}>
        <Text style={styles.cartBarText}>
          Cart: {itemCount} item{itemCount === 1 ? "" : "s"} (${subtotal.toFixed(2)})
        </Text>
        <TouchableOpacity style={styles.cartBarBtn} onPress={() => router.push("/cart")}>
          <Text style={styles.cartBarBtnText}>View Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
