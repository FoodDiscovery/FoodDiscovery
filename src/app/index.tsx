import { View, Text } from 'react-native'
import { useAuth } from '../Providers/AuthProvider'

export default function App() {
  // Get the session from AuthProvider context instead of checking it ourselves
  const { session } = useAuth()

  // display based on session
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {session ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Hello World</Text>
          <Text style={{ fontSize: 16, color: '#666' }}>Signed in as: {session.user.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  )
}