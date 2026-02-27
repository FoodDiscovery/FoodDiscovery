import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../../Providers/CartProvider";
import ProfileHeaderIcon from "../../components/ProfileHeaderIcon";
import { cartStyles as styles, sharedStyles } from "../../components/styles";

export default function CartScreen() {
  const insets = useSafeAreaInsets();

  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  } = useCart();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(10, insets.top * 0.45),
          },
        ]}
      >
        <View style={styles.headerProfileIcon}>
          <ProfileHeaderIcon />
        </View>
        <Text style={styles.headerTitle}>Your Cart</Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: (insets.bottom ?? 0) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Review your selected items before checkout.
        </Text>

        {items.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add menu items from a restaurant page.
            </Text>

            <TouchableOpacity
              style={[styles.pillSmallGold, styles.browseBtnMargin]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.pillSmallGoldText}>Browse restaurants</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.map((item) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.rowTop}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={sharedStyles.emojiIcon}>📷</Text>
                </View>
              )}

              <View style={sharedStyles.flex1}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.restaurantName}
                </Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
              </View>
            </View>

            <View style={styles.rowBottom}>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  activeOpacity={0.85}
                  onPress={() => decrementItem(item.key)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>Qty {item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  activeOpacity={0.85}
                  onPress={() => incrementItem(item.key)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                activeOpacity={0.85}
                onPress={() => removeItem(item.key)}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {items.length > 0 && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{itemCount}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutBtnText}>Check out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.85}
              onPress={clearCart}
            >
              <Text style={styles.clearBtnText}>Clear cart</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
