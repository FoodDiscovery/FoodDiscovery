import React from "react";
import { Pressable, View, Text, GestureResponderEvent } from "react-native";
import { ratingStyles as styles, ratingSizeStyles } from "../styles";

type Size = keyof typeof ratingSizeStyles;

const STAR_FULL = "★";
const STAR_EMPTY = "☆";

// props for the Rating component
interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  label?: string;
  size?: Size;
  accessibilityLabel?: string; 
}
// star rating component that displays a rating and allows the user to rate it
export default function Rating({
  value,
  onChange,
  max = 5,
  label,
  size = "md",
  accessibilityLabel,
}: RatingProps) {
  const isInteractive = typeof onChange === "function";

  // handle event when user taps a star
  const handlePress = (event: GestureResponderEvent, starIndex: number) => {
    if (!isInteractive) return;
    onChange(starIndex + 1);
  };

  const sizeStyle = ratingSizeStyles[size];
  
  // render stars
  const stars = Array.from({ length: max }).map((_, index) => {
    const filled = index + 1 <= Math.round(value);
    const starChar = filled ? STAR_FULL : STAR_EMPTY;

    if (!isInteractive) {
      return (
        <Text key={index} style={[styles.star, sizeStyle.star]}>
          {starChar}
        </Text>
      );
    }

    // render a pressable star that allows the user to rate it
    return (
      <Pressable
        key={index}
        hitSlop={4}
        onPress={(event) => handlePress(event, index)}
        accessibilityRole="button"
        accessibilityLabel={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
      >
        <Text style={[styles.star, sizeStyle.star]}>{starChar}</Text>
      </Pressable>
    );
  });
  
  // accessibility label for the rating component
  const ariaLabel =
    accessibilityLabel ??
    `Rating: ${value.toFixed(1)} out of ${max} star${max === 1 ? "" : "s"}`;

  // render the rating component with the stars and label
  return (
    <View style={styles.container} accessible accessibilityLabel={ariaLabel}>
      <View style={styles.starsRow}>{stars}</View>
      {label != null && label !== "" && (
        <Text style={[styles.label, sizeStyle.label]}>{label}</Text>
      )}
    </View>
  );
}

