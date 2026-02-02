import { View, Text, Alert, Button } from 'react-native'
import { useAuth } from '../Providers/AuthProvider'
import { supabase } from '../lib/supabase'

export default function App() {
  // Get the session from AuthProvider context instead of checking it ourselves
  const { session } = useAuth()


  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert('Error signing out', error.message)
    }
  }

  // display based on session
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {session ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Hello World</Text>
          <Text style={{ fontSize: 16, color: '#666' }}>Signed in as: {session.user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      ) : (
        <Text>Please sign in</Text>
      )}
    </View>
  )
}