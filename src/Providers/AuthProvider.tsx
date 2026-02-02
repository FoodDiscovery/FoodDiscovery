import { useEffect, useState, createContext, useContext } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRouter, useSegments } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'

// Create a context to share the session with child components
const AuthContext = createContext<{ session: Session | null }>({ session: null })

// Hook to access the session from any component
export const useAuth = () => useContext(AuthContext)

// destrucutre the children from passed in props and they are of type ...
// type script says that its of tyoe 'anything that react can render'
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // session is of type Session or null initially
  const [session, setSession] = useState<Session | null>(null)
  const [initialized, setInitialized] = useState(false)
  // tells you where you are in the file system route
  const segments = useSegments()
  // navigation control
  const router = useRouter()

  useEffect(() => {
    // supabase checks asyncStorage/secureStorage looking for saved auth token
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // let us know that supabase token/session restoration from storage) has completed, so the app can now reliably know whether a session exists or not
      setInitialized(true)
    })

    // reacts to auth events and sets the updated session
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (!initialized) {
      return
    }

    const inAuthGroup = segments[0] === '(auth)'

    // user is signed out and trying to access protected content
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (session && inAuthGroup) {  // user is logged in but trying to access login screen
      router.replace('/')
    }
  }, [session, segments, initialized])

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // Provide the session to all child components via context
  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
}
