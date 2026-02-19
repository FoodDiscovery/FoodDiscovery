import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import styles from "../styles/menuViewStyles";

interface CartBarProps {
  itemCount: number;
  subtotal: number;
}

export default function CartBar({ itemCount, subtotal }: CartBarProps) {
  return (
    <View style={styles.cartBar}>
      <Text style={styles.cartBarText}>
        Cart: {itemCount} item{itemCount === 1 ? "" : "s"} (${subtotal.toFixed(2)})
      </Text>
      <TouchableOpacity style={styles.cartBarBtn} onPress={() => router.push("/cart")}>
        <Text style={styles.cartBarBtnText}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

