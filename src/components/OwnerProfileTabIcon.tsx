import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { supabase } from "../lib/supabase";

interface OwnerProfileTabIconProps {
  color: string;
  size: number;
}

export default function OwnerProfileTabIcon({
  color,
  size,
}: OwnerProfileTabIconProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLogo() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from("restaurants")
        .select("image_url")
        .eq("owner_id", userId)
        .maybeSingle();

      if (!mounted) return;
      setLogoUrl(data?.image_url ?? null);
    }

    loadLogo();
    return () => {
      mounted = false;
    };
  }, []);

  if (logoUrl)
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );

  return <FontAwesome name="user" color={color} size={size} />;
}
