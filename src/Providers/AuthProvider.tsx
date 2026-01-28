import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRouter, useSegments } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [initialized, setInitialized] = useState(false)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] Initial session check:', session ? `User: ${session.user.email}` : 'No session')
      setSession(session)
      setInitialized(true)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthProvider] Auth state changed:', _event, session ? `User: ${session.user.email}` : 'No session')
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (!initialized) {
      console.log('[AuthProvider] Not initialized yet, waiting...')
      return
    }

    const inAuthGroup = segments[0] === '(auth)'
    console.log('[AuthProvider] Routing check - Session:', session ? 'exists' : 'null', 'In auth group:', inAuthGroup, 'Segments:', segments)

    if (!session && !inAuthGroup) {
      console.log('[AuthProvider] No session and not in auth group, redirecting to sign-in')
      router.replace('/(auth)/sign-in')
    } else if (session && inAuthGroup) {
      console.log('[AuthProvider] Session exists and in auth group, redirecting to home')
      router.replace('/')
    } else {
      console.log('[AuthProvider] No redirect needed')
    }
  }, [session, segments, initialized])

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>
}
