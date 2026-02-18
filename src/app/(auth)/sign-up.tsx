import React, { useState } from 'react'
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { File } from 'expo-file-system/next'
import { decode } from 'base64-arraybuffer'
import styles from './authStyles'
import BusinessHoursEditor from '../../components/BusinessHoursEditor'
import {
  WeeklyBusinessHours,
  createDefaultBusinessHours,
  validateWeeklyBusinessHours,
} from '../../lib/businessHours'

type RoleType = 'customer' | 'owner'

interface BusinessInfo {
  name: string
  address: string
  phone: string
  description: string
  cuisineType: string
  businessHours: WeeklyBusinessHours
  imageUri: string | null
}

type BusinessInfoTextField = Exclude<keyof BusinessInfo, 'businessHours' | 'imageUri'>

function RoleToggle({
  selectedRole,
  onRoleChange,
}: {
  selectedRole: RoleType
  onRoleChange: (role: RoleType) => void
}) {
  return (
    <View style={styles.roleToggleContainer}>
      <Text style={styles.roleLabel}>I want to register as:</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedRole === 'customer' && styles.toggleButtonActive,
          ]}
          onPress={() => onRoleChange('customer')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              selectedRole === 'customer' && styles.toggleButtonTextActive,
            ]}
          >
            Customer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedRole === 'owner' && styles.toggleButtonActive,
          ]}
          onPress={() => onRoleChange('owner')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              selectedRole === 'owner' && styles.toggleButtonTextActive,
            ]}
          >
            Business Owner
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BusinessInfoForm({
  businessInfo,
  onUpdate,
  onUpdateBusinessHours,
  onPickImage,
  isUploadingImage,
}: {
  businessInfo: BusinessInfo
  onUpdate: (field: BusinessInfoTextField, value: string) => void
  onUpdateBusinessHours: (value: WeeklyBusinessHours) => void
  onPickImage: () => void
  isUploadingImage: boolean
}) {
  return (
    <View style={styles.businessSection}>
      <Text style={styles.sectionTitle}>Business Information</Text>
      <Text style={styles.sectionSubtitle}>
        Please provide details about your business
      </Text>

      <View style={styles.verticallySpaced}>
        <Input
          label="Business Name *"
          onChangeText={(text) => onUpdate('name', text)}
          value={businessInfo.name}
          placeholder="e.g., FoodDiscovery Cafe"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Address *"
          onChangeText={(text) => onUpdate('address', text)}
          value={businessInfo.address}
          placeholder="e.g., 123 Main St, City, State"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Phone Number *"
          onChangeText={(text) => onUpdate('phone', text)}
          value={businessInfo.phone}
          placeholder="e.g., (555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Description"
          onChangeText={(text) => onUpdate('description', text)}
          value={businessInfo.description}
          placeholder="Tell customers about your business..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Cuisine Type"
          onChangeText={(text) => onUpdate('cuisineType', text)}
          value={businessInfo.cuisineType}
          placeholder="e.g., Italian, Mexican, Thai"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={styles.imageLabel}>Business Hours *</Text>
        <BusinessHoursEditor
          value={businessInfo.businessHours}
          onChange={onUpdateBusinessHours}
        />
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.imageLabel}>Business Image *</Text>
        {businessInfo.imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: businessInfo.imageUri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={onPickImage}
              disabled={isUploadingImage}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.pickImageButton}
            onPress={onPickImage}
            disabled={isUploadingImage}
          >
            <Text style={styles.pickImageText}>
              {isUploadingImage ? 'Loading...' : 'Select Image'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType>('customer')
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    address: '',
    phone: '',
    description: '',
    cuisineType: '',
    businessHours: createDefaultBusinessHours(),
    imageUri: null,
  })

  function updateBusinessInfo(field: BusinessInfoTextField, value: string) {
    setBusinessInfo((prev) => ({ ...prev, [field]: value }))
  }

  function updateBusinessHours(value: WeeklyBusinessHours) {
    setBusinessInfo((prev) => ({ ...prev, businessHours: value }))
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to upload an image.'
      )
      return
    }

    setIsUploadingImage(true)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    })
    setIsUploadingImage(false)

    if (!result.canceled && result.assets[0]?.uri) {
      setBusinessInfo((prev) => ({ ...prev, imageUri: result.assets[0].uri }))
    }
  }

  function validateOwnerSignup(): boolean {
    if (!businessInfo.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your business name.')
      return false
    }
    if (!businessInfo.address.trim()) {
      Alert.alert('Missing Information', 'Please enter your business address.')
      return false
    }
    if (!businessInfo.phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your business phone number.')
      return false
    }
    if (!businessInfo.imageUri) {
      Alert.alert('Missing Information', 'Please upload a business image.')
      return false
    }
    const businessHoursError = validateWeeklyBusinessHours(businessInfo.businessHours)
    if (businessHoursError) {
      Alert.alert('Invalid Business Hours', businessHoursError)
      return false
    }
    return true
  }

  async function uploadBusinessImage(
    userId: string,
    restaurantId: string
  ): Promise<string | null> {
    if (!businessInfo.imageUri) return null

    try {
      // Use the new File class from expo-file-system/next
      const file = new File(businessInfo.imageUri)
      const base64 = await file.base64()
      const arrayBuffer = decode(base64)

      const fileExt = businessInfo.imageUri.toLowerCase().includes('.png')
        ? 'png'
        : 'jpg'
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg'
      const path = `${userId}/${restaurantId}/image.${fileExt}`

      const { error: uploadErr } = await supabase.storage
        .from('restaurant-images')
        .upload(path, arrayBuffer, {
          contentType,
          upsert: true,
        })

      if (uploadErr) {
        console.error('Image upload error:', uploadErr)
        return null
      }

      const { data } = supabase.storage.from('restaurant-images').getPublicUrl(path)
      return data?.publicUrl ?? null
    } catch (err) {
      console.error('Image upload failed:', err)
      return null
    }
  }

  async function createRestaurantForOwner(userId: string): Promise<boolean> {
    // First create the restaurant entry to get the ID
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert([
        {
          owner_id: userId,
          name: businessInfo.name.trim(),
          description: businessInfo.description.trim(),
          cuisine_type: businessInfo.cuisineType.trim(),
          business_hours: businessInfo.businessHours,
          phone: businessInfo.phone.trim(),
          image_url: '', // Will update after image upload
        },
      ])
      .select('id')
      .single()

    if (restaurantError || !restaurant) {
      console.error('Restaurant creation error:', restaurantError)
      Alert.alert(
        'Registration Error',
        'Failed to create your business profile. Please try again.'
      )
      return false
    }

    // Upload the image and update the restaurant
    const imageUrl = await uploadBusinessImage(userId, restaurant.id)
    if (imageUrl) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ image_url: imageUrl })
        .eq('id', restaurant.id)

      if (updateError) {
        console.error('Image URL update error:', updateError)
      }
    }

    // Create location entry for the restaurant
    if (businessInfo.address.trim()) {
      const { error: locationError } = await supabase.from('locations').insert([
        {
          restaurant_id: restaurant.id,
          address_text: businessInfo.address.trim(),
        },
      ])

      if (locationError) {
        console.error('Location creation error:', locationError)
        // Non-critical error, continue
      }
    }

    return true
  }

  async function signUpWithEmail() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password.')
      return
    }

    if (selectedRole === 'owner' && !validateOwnerSignup()) {
      return
    }

    setLoading(true)

    const {
      data: { session, user },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: selectedRole,
        },
      },
    })

    if (error) {
      Alert.alert('Sign Up Error', error.message)
      setLoading(false)
      return
    }

    // If owner role and we have a user, create the restaurant
    // Note: User might need email verification first, so we handle both cases
    if (selectedRole === 'owner' && user) {
      const success = await createRestaurantForOwner(user.id)
      if (!success) {
        setLoading(false)
        return
      }
    }

    if (!session) {
      Alert.alert(
        'Verification Required',
        'Please check your inbox for email verification!'
      )
    }
    // Note: If session exists, AuthProvider will automatically redirect to home
    // Don't call router.replace('/') here to avoid double navigation
    setLoading(false)
  }

  const isOwner = selectedRole === 'owner'

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, styles.signUpContainer]}>
          <Text style={styles.title}>Create Account</Text>

          <RoleToggle selectedRole={selectedRole} onRoleChange={setSelectedRole} />

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Input
              label="Password"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize="none"
            />
          </View>

          {isOwner && (
            <BusinessInfoForm
              businessInfo={businessInfo}
              onUpdate={updateBusinessInfo}
              onUpdateBusinessHours={updateBusinessHours}
              onPickImage={pickImage}
              isUploadingImage={isUploadingImage}
            />
          )}

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title={loading ? 'Creating Account...' : 'Sign up'}
              disabled={loading || isUploadingImage}
              onPress={signUpWithEmail}
            />
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

