import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { useCart } from "../../Providers/CartProvider";
import { menuViewStyles as styles } from "../../components/styles";

export default function CartScreen() {
  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  } = useCart();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.heading}>Your Cart</Text>
        <Text style={styles.subtitle}>
          Review your selected items before checkout.
        </Text>

        {items.length === 0 && (
          <Text style={styles.emptyText}>
            Your cart is empty. Add menu items from a restaurant page.
          </Text>
        )}

        {items.map((item) => (
          <View key={item.key} style={styles.categoryCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
              ) : (
                <View style={styles.itemThumbPlaceholder}>
                  <Text style={{ fontSize: 18 }}>📷</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.restaurantName}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity style={styles.addBtn} onPress={() => decrementItem(item.key)}>
                <Text style={styles.addBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.itemName}>Qty {item.quantity}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => incrementItem(item.key)}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: "#B42318" }]}
                onPress={() => removeItem(item.key)}
              >
                <Text style={styles.addBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.categoryCard}>
          <Text style={styles.itemName}>Items: {itemCount}</Text>
          <Text style={styles.itemPrice}>Subtotal: ${subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { alignItems: "center", paddingVertical: 12 }]}
          onPress={() => router.push("/checkout")}
        >
          <Text style={[styles.addBtnText, { fontSize: 16 }]}>Check out</Text>
        </TouchableOpacity>

        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.backBtn, { alignSelf: "center" }]}
            onPress={clearCart}
          >
            <Text style={styles.backBtnText}>Clear cart</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
