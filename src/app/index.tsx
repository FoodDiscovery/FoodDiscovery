import { View, Text } from 'react-native'
import { useAuth } from '../Providers/AuthProvider'
// import { View, Button } from "react-native";
// import React from "react";
// import { Link } from "expo-router";

// const index = () => {

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 10 }}>
//       <Link href={"/(auth)"} asChild>
//         <Button title="Sign in" />
//       </Link>
//     </View>
//   );
// };

// export default index;

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { View, Text, ActivityIndicator, Button, Alert } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  // Get the session from AuthProvider context instead of checking it ourselves
  const { session } = useAuth()

  // display based on session
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert('Error signing out', error.message)
    }
  }

  useEffect(() => {
    console.log('[App] Checking session on mount...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[App] Session check result:', session ? `User: ${session.user.email}` : 'No session')
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[App] Auth state changed:', _event, session ? `User: ${session.user.email}` : 'No session')
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) {
      console.log('[App] Rendering with session - User:', session.user.email)
    } else {
      console.log('[App] Rendering without session')
    }
  }, [session])

  if (loading) {
    console.log('[App] Still loading...')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {session ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Hello World</Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>Signed in as: {session.user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  )
}