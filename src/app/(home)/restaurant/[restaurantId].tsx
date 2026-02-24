// src/app/(home)/restaurant/[restaurantId].tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
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
import MenuCategoryCard from "../../../components/menu/MenuCategoryCard";
import CartBar from "../../../components/menu/CartBar";
import ProfileHeaderIcon from "../../../components/ProfileHeaderIcon";
import styles from "../../../components/styles/restaurantMenuStyles";

// ✅ Fix: forbid require() imports
import FoodDiscoveryLogo from "../../../../assets/images/fooddiscovery-logo.png";

interface RestaurantSummary {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
}

interface ProfileRow {
  role?: string | null;
}

export default function RestaurantMenuScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { items: cartItems, addItem, incrementItem, decrementItem, itemCount, subtotal } =
    useCart();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<number, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category_id);
      if (list) list.push(item);
      else map.set(item.category_id, [item]);
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
          Alert.alert(
            "Load failed",
            "Could not load menu categories: " + categoriesRes.error.message
          );
          setLoading(false);
          return;
        }

        const prof = (profileRes.data as ProfileRow | null) ?? null;
        setIsOwner((prof?.role ?? "").toLowerCase() === "owner");
        setRestaurant(restaurantRes.data as RestaurantSummary);

        const loadedCategories = (categoriesRes.data ?? []) as MenuCategory[];
        setCategories(loadedCategories);

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
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.mutedText}>Loading menu…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Owners shouldn’t use the customer menu page
  if (isOwner) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.center, { paddingHorizontal: 20 }]}>
          <Text style={styles.ownerTitle}>Customer Menu Page</Text>
          <Text style={styles.ownerSub}>
            This page is for customer accounts. Owners can use Edit Menu instead.
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.pillSmallNavy,
              pressed && { opacity: 0.85 },
              { marginTop: 14 },
            ]}
          >
            <Text style={styles.pillSmallNavyText}>← Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Top row: profile icon (left), centered logo, back button (right) */}
      <View style={[styles.topRow, { paddingTop: Math.max(10, insets.top * 0.45) }]}>
        <View style={styles.headerProfileIcon}>
          <ProfileHeaderIcon />
        </View>
        <View style={styles.topLogoWrap} pointerEvents="none">
          <Image source={FoodDiscoveryLogo} style={styles.topLogo} resizeMode="contain" />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: 24 + (itemCount > 0 ? 72 : 0) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant header card */}
        <View style={styles.headerCard}>
          <Text style={styles.heading}>{restaurant?.name ?? "Restaurant Menu"}</Text>

          {!!restaurant?.cuisine_type && (
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineTagText}>{restaurant.cuisine_type}</Text>
            </View>
          )}

          {!!restaurant?.description && (
            <Text style={styles.subtitle}>{restaurant.description}</Text>
          )}
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No menu yet</Text>
            <Text style={styles.emptySub}>This restaurant hasn’t published menu categories.</Text>
          </View>
        ) : (
          categories.map((category) => {
            const categoryItems = itemsByCategory.get(category.id) ?? [];
            return (
              <View key={category.id} style={styles.sectionWrap}>
                <MenuCategoryCard
                  category={category}
                  items={categoryItems}
                  getItemQuantity={getItemQuantity}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Cart Bar (unchanged behavior) */}
      <CartBar itemCount={itemCount} subtotal={subtotal} />
    </SafeAreaView>
  );
}