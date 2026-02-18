import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { tabPlaceholderStyles as styles } from "../../components/styles";

export default function OwnerHomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
      </View>
    </SafeAreaView>
  );
}

