import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../Providers/CartProvider";
import { useAuth } from "../../../Providers/AuthProvider";
import type { MenuCategory, MenuItem } from "../../../components/menu/types";
import styles from "../../../components/styles/menuViewStyles";
import MenuCategoryCard from "../../../components/menu/MenuCategoryCard";
import CartBar from "../../../components/menu/CartBar";

type RestaurantSummary = {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
};

export default function RestaurantMenuScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { items: cartItems, addItem, incrementItem, decrementItem, itemCount, subtotal } = useCart();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // sort the items into their categories for display
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
      if (!restaurantId || !session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch restaurant, categories, and profile in parallel
        const [restaurantRes, categoriesRes, profileRes] = await Promise.all([
          supabase
            .from("restaurants")
            .select("id,name,description,cuisine_type")
            .eq("id", restaurantId)
            .single(),
          supabase
            .from("menu_categories")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("display_order", { ascending: true }),
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle(),
        ]);

        if (restaurantRes.error) {
          Alert.alert("Load failed", restaurantRes.error.message);
          setLoading(false);
          return;
        }

        if (categoriesRes.error) {
          Alert.alert("Load failed", "Could not load menu categories: " + categoriesRes.error.message);
          setLoading(false);
          return;
        }

        // Continue even if profile row is missing/duplicated; treat as customer by default.
        if (profileRes.error) {
          console.warn("Profile load warning:", profileRes.error.message);
        }

        setRestaurant(restaurantRes.data as RestaurantSummary);
        setIsOwner(profileRes.data?.role === "owner");

        const loadedCategories = (categoriesRes.data ?? []) as MenuCategory[];
        setCategories(loadedCategories);

        // Fetch menu items for all categories
        if (loadedCategories.length > 0) {
          const catIds = loadedCategories.map((c) => c.id);
          const { data: menuItems, error: itemsErr } = await supabase
            .from("menu_items")
            .select("*")
            .in("category_id", catIds);

          if (itemsErr) {
            Alert.alert("Load failed", "Could not load menu items: " + itemsErr.message);
            setLoading(false);
            return;
          }

          setItems((menuItems ?? []) as MenuItem[]);
        } else {
          setItems([]);
        }
      } catch (error) {
        Alert.alert("Load failed", error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadMenuForRestaurant();
  }, [restaurantId, session]);

  const getItemQuantity = (itemId: number): number => {
    if (!restaurant) return 0;
    const key = `${restaurant.id}:${itemId}`;
    const cartItem = cartItems.find((i) => i.key === key);
    return cartItem?.quantity ?? 0;
  };

  const handleIncrement = (item: MenuItem) => {
    if (!restaurant) return;
    const key = `${restaurant.id}:${item.id}`;
    const currentQuantity = getItemQuantity(item.id);
    if (currentQuantity === 0) {
      addItem({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name ?? "Restaurant",
        itemId: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.image_url,
      });
    } else if (currentQuantity < 20) {
      incrementItem(key);
    }
  };

  const handleDecrement = (item: MenuItem) => {
    if (!restaurant) return;
    const key = `${restaurant.id}:${item.id}`;
    decrementItem(key);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              position: "absolute",
              top: Math.max(8, insets.top * 0.25),
              left: 16,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={[
            styles.page,
            { paddingTop: Math.max(60, insets.top + 20) },
          ]}
        >
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
              <MenuCategoryCard
                key={category.id}
                category={category}
                items={categoryItems}
                getItemQuantity={getItemQuantity}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            );
          })}
        </ScrollView>

        <CartBar itemCount={itemCount} subtotal={subtotal} />
      </View>
    </SafeAreaView>
  );
}
