import React, { useEffect, useState } from "react";
import { getAvatarStyle } from "./styles";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { supabase } from "../lib/supabase";
import CachedImage from "./CachedImage";

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
    return <CachedImage uri={logoUrl} style={getAvatarStyle(size)} />;

  return <FontAwesome name="user" color={color} size={size} />;
}
