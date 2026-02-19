import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeStyles as styles } from "../styles";
import { useHome } from "../../Providers/HomeProvider";

export default function FiltersModal() {
  const insets = useSafeAreaInsets();
  const { filtersOpen, setFiltersOpen, cuisineOptions, selectedCuisines, toggleCuisine } = useHome();

  return (
    <Modal visible={filtersOpen} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Pressable onPress={() => setFiltersOpen(false)} hitSlop={10}>
              <Text style={styles.modalClose}>Done</Text>
            </Pressable>
          </View>

          <Text style={styles.modalSectionTitle}>Cuisine</Text>

          {cuisineOptions.length === 0 ? (
            <Text style={styles.emptyCuisineText}>No cuisine types found yet.</Text>
          ) : (
            <View style={styles.cuisineGrid}>
              {cuisineOptions.map((c) => {
                const active = selectedCuisines.includes(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => toggleCuisine(c)}
                    style={({ pressed }) => [
                      styles.cuisineChip,
                      active && styles.cuisineChipActive,
                      pressed && styles.pressedOpacity85,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cuisineChipText,
                        active && styles.cuisineChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

