import React from "react";
import { Pressable, Text } from "react-native";
import { homeStyles as styles } from "../styles";
import { useHome } from "../../Providers/HomeProvider";

export default function ClearButton() {
  const { query, selectedCuisines, setQuery, setSelectedCuisines } = useHome();

  if (selectedCuisines.length === 0 && query.trim().length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={() => {
        setQuery("");
        setSelectedCuisines([]);
      }}
      style={({ pressed }) => [styles.pill, pressed && styles.pressedOpacity80]}
    >
      <Text style={styles.pillText}>Clear</Text>
    </Pressable>
  );
}

