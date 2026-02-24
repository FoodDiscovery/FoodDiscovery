import { Tabs } from "expo-router";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import HomeProvider from "../../Providers/HomeProvider";
import OrderDetailCacheProvider from "../../Providers/OrderDetailCacheProvider";

export default function HomeLayout() {
  return (
    <HomeProvider>
      <OrderDetailCacheProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map-marker" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="order-history"
        options={{
          title: "Order History",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="history" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="order/[orderId]" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[restaurantId]" options={{ href: null }} />
      </Tabs>
      </OrderDetailCacheProvider>
    </HomeProvider>
  );
}
