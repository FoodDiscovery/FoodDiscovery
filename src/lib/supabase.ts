import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js'

function requiredEnv(name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const supabaseUrl = requiredEnv("EXPO_PUBLIC_SUPABASE_URL");
const supabasePublishableKey = requiredEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
        

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})