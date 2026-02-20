import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../Providers/AuthProvider";
import { supabase } from "../lib/supabase";
import { appIndexStyles as styles } from "../components/styles";

export default function App() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function routeUserByRole() {
      if (!session?.user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "owner") {
        router.replace("/(owner)/home");
        return;
      }

      router.replace("/(home)/home");
    }

    routeUserByRole();
  }, [session, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

