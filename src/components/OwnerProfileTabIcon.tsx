import React, { useCallback, useEffect, useState } from "react";
import { getAvatarStyle } from "./styles";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { supabase } from "../lib/supabase";
import CachedImage from "./CachedImage";
import { useFocusEffect } from "@react-navigation/native";
import {
  getOwnerLogoUrl,
  setOwnerLogoUrl,
  subscribeOwnerLogoUrl,
} from "../lib/ownerLogoStore";

interface OwnerProfileTabIconProps {
  color: string;
  size: number;
}

export default function OwnerProfileTabIcon({
  color,
  size,
}: OwnerProfileTabIconProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getOwnerLogoUrl());

  const loadLogo = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setOwnerLogoUrl(null);
      return;
    }

    const { data } = await supabase
      .from("restaurants")
      .select("image_url")
      .eq("owner_id", userId)
      .maybeSingle();

    setOwnerLogoUrl(data?.image_url ?? null);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeOwnerLogoUrl(() => {
      setLogoUrl(getOwnerLogoUrl());
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogo();
    }, [loadLogo])
  );

  if (logoUrl)
    return <CachedImage uri={logoUrl} style={getAvatarStyle(size)} />;

  return <FontAwesome name="user" color={color} size={size} />;
}
