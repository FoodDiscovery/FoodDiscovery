import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import styles from "../../components/menu/menuViewStyles";

export default function CheckoutScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.heading}>Check out coming soon</Text>
      <Text style={styles.subtitle}>
        We are still building checkout. Your cart flow is ready for the next step.
      </Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}
