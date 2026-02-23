import { Pressable, Text } from "react-native";
import { homeStyles as styles } from "../styles";
import { useHome } from "../../Providers/HomeProvider";

export default function SortButton() {
  const { sortMode, onPressSort } = useHome();

  return (
    <Pressable
      onPress={onPressSort}
      style={({ pressed }) => [styles.pill, pressed && styles.pressedOpacity80]}
    >
      <Text style={styles.pillText}>
        Sort: {sortMode === "name" ? "Name" : "Distance"}
      </Text>
    </Pressable>
  );
}

