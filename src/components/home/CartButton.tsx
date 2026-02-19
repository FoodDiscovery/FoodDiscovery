import React from "react";
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { homeStyles as styles } from "../styles";
import { useCart } from "../../Providers/CartProvider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Pressable
      onPress={() => router.push("/cart")}
      style={({ pressed }) => [styles.pill, pressed && styles.pressedOpacity80]}
    >
      <Text style={styles.pillText}>Cart ({itemCount})</Text>
    </Pressable>
  );
}

