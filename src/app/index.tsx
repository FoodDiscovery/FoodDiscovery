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

// import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
// import Auth from '\(auth\)/sign-in'
import { View, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      <Auth />
      {session && session.user && <Text>{session.user.id}</Text>}
    </View>
  )
}