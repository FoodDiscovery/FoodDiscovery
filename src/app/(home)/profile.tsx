import { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Providers/AuthProvider";
import { supabase } from "../../lib/supabase";
import { customerProfileStyles as styles } from "../../components/styles";
import CustomerProfileIcon from "../../components/CustomerProfileIcon";

export default function CustomerProfileScreen() {
  const { session } = useAuth();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      setFullName(data?.full_name ?? "");
    }

    loadProfile();
  }, [session?.user?.id]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error signing out", error.message);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
      <Text style={styles.title}>Settings / Profile</Text>
        {fullName.trim() ? (
          <>
            <Text style={styles.nameText}>{fullName.trim()}</Text>
          </>
        ) : null}
        
        {session?.user?.id ? (
          <>
            <CustomerProfileIcon userId={session.user.id} size={96} />
            <Text style={styles.avatarHint}>Tap the icon to change your profile photo</Text>
          </>
        ) : null}
        
        <Text style={styles.subtitle}>{session?.user?.email ?? "Signed in"}</Text>
        <View style={styles.buttonWrap}>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

