import React from "react";
import { Pressable, Text } from "react-native";
import { homeStyles as styles } from "../styles";
import { useHome } from "../../Providers/HomeProvider";

export default function FilterButton() {
  const { setFiltersOpen } = useHome();

  return (
    <Pressable
      onPress={() => setFiltersOpen(true)}
      style={({ pressed }) => [styles.pillPrimary, pressed && styles.pressedOpacity80]}
    >
      <Text style={styles.pillPrimaryText}>Filters</Text>
    </Pressable>
  );
}

