import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../Providers/AuthProvider";
import { supabase } from "../lib/supabase";

export default function App() {
  const { session } = useAuth();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) {
        setIsOwner(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsOwner(profile?.role === "owner");
    };

    checkUserRole();
  }, [session]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error signing out", error.message);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      {session ? (
        <View style={{ alignItems: "center", gap: 12, width: "100%" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Hello World</Text>
          <Text style={{ fontSize: 16, color: "#666" }}>
            Signed in as: {session.user.email}
          </Text>

          <Button title="Sign Out" onPress={handleSignOut} />

          {isOwner && (
            <Button
              title="Edit Restaurant"
              onPress={() => router.push("/(owner)/restaurant-edit")}
            />
          )}
        </View>
      ) : (
        <View style={{ gap: 12, width: "100%" }}>
          <Text style={{ textAlign: "center" }}>Please sign in</Text>

          <Link href="/(auth)/sign-in" asChild>
            <Button title="Sign in" />
          </Link>

          <Link href="/(auth)/sign-up" asChild>
            <Button title="Create account" />
          </Link>
        </View>
      )}
    </View>
  );
}
