import { Tabs } from "expo-router";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import OwnerProfileTabIcon from "../../components/OwnerProfileTabIcon";

export default function OwnerLayout() {
  return (
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
        name="analytics"
        options={{
          title: "Analytics",
          unmountOnBlur: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu-edit"
        options={{
          title: "Edit Menu",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cutlery" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <OwnerProfileTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="order/[orderId]" options={{ href: null }} />
    </Tabs>
  );
}
