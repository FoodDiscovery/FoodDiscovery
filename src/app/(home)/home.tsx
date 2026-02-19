// src/app/(home)/home.tsx
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { homeStyles as styles } from "../../components/styles";
import FiltersModal from "../../components/home/FiltersModal";
import RestaurantList from "../../components/home/RestaurantList";
import FilterButton from "../../components/home/FilterButton";
import SortButton from "../../components/home/SortButton";
import CartButton from "../../components/home/CartButton";
import ClearButton from "../../components/home/ClearButton";
import { useHome } from "../../Providers/HomeProvider";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { query, setQuery, headerSubtitle } = useHome();


  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header (title + profile button) */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(8, insets.top * 0.25),
          },
        ]}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            Food Discovery
          </Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        {/* Profile button (top-right, NOT cut off) */}
        <Pressable
          onPress={() => router.push("/(home)/profile")}
          style={({ pressed }) => [
            styles.profileBtn,
            pressed && styles.pressedOpacity70,
          ]}
          hitSlop={10}
        >
          <Text style={styles.profileBtnText}>Profile</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or cuisine"
          placeholderTextColor="#9AA0A6"
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <FilterButton />
        <SortButton />
        <CartButton />
        <ClearButton />
      </View>

      {/* List */}
      <RestaurantList />

      {/* Filters Modal */}
      <FiltersModal />
    </SafeAreaView>
  );
}
