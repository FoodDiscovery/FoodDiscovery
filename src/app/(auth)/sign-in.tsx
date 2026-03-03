import React, { useState, useRef, useEffect } from 'react'
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'
import { authStyles as styles } from '../../components/styles'

import FoodDiscoveryLogo from '../../../assets/images/fooddiscovery-logo.png'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const keyboardVisibleRef = useRef(false)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handleAuthFieldFocus = () => {
    if (!keyboardVisibleRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 300)
    }
  }

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message)
    }
    // Note: AuthProvider will automatically redirect to home on successful sign-in
    // Don't call router.replace('/') here to avoid double navigation
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={FoodDiscoveryLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.formCard}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to discover local restaurants</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Input
                label="Email"
                onChangeText={(text) => setEmail(text)}
                value={email}
                onFocus={handleAuthFieldFocus}
                placeholder="email@address.com"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9AA0A6"
                containerStyle={styles.inputContainer}
                inputContainerStyle={styles.input}
                inputStyle={{ color: '#111827', fontSize: 16 }}
                labelStyle={styles.inputLabel}
              />
            </View>
            <View style={styles.verticallySpaced}>
              <Input
                label="Password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                onFocus={handleAuthFieldFocus}
                secureTextEntry
                placeholder="Password"
                autoCapitalize="none"
                placeholderTextColor="#9AA0A6"
                containerStyle={styles.inputContainer}
                inputContainerStyle={styles.input}
                inputStyle={{ color: '#111827', fontSize: 16 }}
                labelStyle={styles.inputLabel}
              />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Button
                title="Sign in"
                disabled={loading}
                onPress={() => signInWithEmail()}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
              />
            </View>
          </View>
          <View style={styles.linkWrap}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
