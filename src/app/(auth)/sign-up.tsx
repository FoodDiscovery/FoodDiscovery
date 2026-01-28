import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    console.log('[SignUp] Attempting to sign up with email:', email)
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      console.log('[SignUp] Sign up error:', error.message)
      Alert.alert(error.message)
      setLoading(false)
    } else if (!session) {
      console.log('[SignUp] Sign up successful but no session - email verification required')
      Alert.alert('Please check your inbox for email verification!')
      setLoading(false)
    } else {
      console.log('[SignUp] Sign up successful! User:', session.user?.email)
      console.log('[SignUp] Redirecting to home page...')
      router.replace('/')
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
})

