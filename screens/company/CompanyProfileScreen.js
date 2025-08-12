import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../context/AuthContext'
import { CommonActions } from '@react-navigation/native'

function CompanyProfileScreen({ navigation }) {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: null,
    coverImage: null,
    website: '',
    established: '',
    teamSize: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    notifications: {
      newBooking: true,
      bookingUpdates: true,
      messages: true,
      marketing: false,
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setLoading(false)
        return
      }

      const decoded = jwtDecode(token)
      setTimeout(() => {
        setProfile({
          id: 'comp123',
          name: 'Himalayan Adventures',
          email: 'info@himalayanadventures.com',
          phone: '+977 1234567890',
          address: 'Thamel, Kathmandu, Nepal',
          description:
            'We are a premier trekking company based in Nepal, specializing in Himalayan adventures. With over 10 years of experience, we provide safe, memorable, and authentic trekking experiences in Nepal, Tibet, and Bhutan.',
          logo: 'https://images.unsplash.com/photo-1581873372796-635b67ca2008',
          coverImage:
            'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
          website: 'www.himalayanadventures.com',
          established: '2010',
          teamSize: '25',
          socialLinks: {
            facebook: 'facebook.com/himalayanadventures',
            instagram: 'instagram.com/himalayanadventures',
            twitter: 'twitter.com/himalayanadv',
          },
          notifications: {
            newBooking: true,
            bookingUpdates: true,
            messages: true,
            marketing: false,
          },
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching profile:', error)
      Alert.alert('Error', 'Failed to fetch profile')
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      //! Validate form
      if (!profile.name || !profile.email || !profile.phone) {
        Alert.alert('Error', 'Name, email and phone are required')
        setSaving(false)
        return
      }

      // Mock API call - replace with actual API call
      setTimeout(() => {
        setSaving(false)
        setEditMode(false)
        Alert.alert('Success', 'Profile updated successfully')
      }, 1000)
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Failed to save profile')
      setSaving(false)
    }
  }

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        if (type === 'logo') {
          setProfile({ ...profile, logo: result.assets[0].uri })
        } else {
          setProfile({ ...profile, coverImage: result.assets[0].uri })
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const toggleNotification = (key) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications[key],
      },
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'UserType' } }],
        })
      )
    } catch (error) {
      console.error('Logout error:', error)
      Alert.alert('Error', 'Failed to logout. Please try again.')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Company Profile</Text>
        {!editMode ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditMode(true)}
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditMode(false)}
          >
            <Ionicons name="close-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverImageContainer}>
          {profile.coverImage ? (
            <Image
              source={{ uri: profile.coverImage }}
              style={styles.coverImage}
            />
          ) : (
            <View style={[styles.coverImage, styles.placeholderCover]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}

          {editMode && (
            <TouchableOpacity
              style={styles.changeCoverButton}
              onPress={() => pickImage('cover')}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.changeImageText}>Change Cover</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.logoContainer}>
          {profile.logo ? (
            <Image source={{ uri: profile.logo }} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoImage, styles.placeholderLogo]}>
              <Ionicons name="business-outline" size={40} color="#ccc" />
            </View>
          )}

          {editMode && (
            <TouchableOpacity
              style={styles.changeLogoButton}
              onPress={() => pickImage('logo')}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileInfo}>
          {editMode ? (
            <TextInput
              style={styles.nameInput}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Company Name"
            />
          ) : (
            <Text style={styles.companyName}>{profile.name}</Text>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="mail-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Email</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.email}
                  onChangeText={(text) =>
                    setProfile({ ...profile, email: text })
                  }
                  placeholder="Email Address"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.email}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Phone</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.phone}
                  onChangeText={(text) =>
                    setProfile({ ...profile, phone: text })
                  }
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.phone}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Address</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.address}
                  onChangeText={(text) =>
                    setProfile({ ...profile, address: text })
                  }
                  placeholder="Company Address"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.address}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="globe-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Website</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.website}
                  onChangeText={(text) =>
                    setProfile({ ...profile, website: text })
                  }
                  placeholder="Website URL"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.website}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Details</Text>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Established</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.established}
                  onChangeText={(text) =>
                    setProfile({ ...profile, established: text })
                  }
                  placeholder="Year Established"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.established}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="people-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Team Size</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.teamSize}
                  onChangeText={(text) =>
                    setProfile({ ...profile, teamSize: text })
                  }
                  placeholder="Number of Employees"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.teamSize} employees
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="document-text-outline" size={18} color="#666" />
                <Text style={styles.fieldLabelText}>Description</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={[styles.fieldInput, styles.textArea]}
                  value={profile.description}
                  onChangeText={(text) =>
                    setProfile({ ...profile, description: text })
                  }
                  placeholder="Company Description"
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.description}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="logo-facebook" size={18} color="#3b5998" />
                <Text style={styles.fieldLabelText}>Facebook</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.socialLinks.facebook}
                  onChangeText={(text) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, facebook: text },
                    })
                  }
                  placeholder="Facebook URL"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.socialLinks.facebook}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="logo-instagram" size={18} color="#e1306c" />
                <Text style={styles.fieldLabelText}>Instagram</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.socialLinks.instagram}
                  onChangeText={(text) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, instagram: text },
                    })
                  }
                  placeholder="Instagram URL"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.socialLinks.instagram}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabel}>
                <Ionicons name="logo-twitter" size={18} color="#1da1f2" />
                <Text style={styles.fieldLabelText}>Twitter</Text>
              </View>
              {editMode ? (
                <TextInput
                  style={styles.fieldInput}
                  value={profile.socialLinks.twitter}
                  onChangeText={(text) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: text },
                    })
                  }
                  placeholder="Twitter URL"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.socialLinks.twitter}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons name="notifications-outline" size={18} color="#666" />
                <Text style={styles.switchLabelText}>New Booking Alerts</Text>
              </View>
              <Switch
                value={profile.notifications.newBooking}
                onValueChange={() => toggleNotification('newBooking')}
                disabled={!editMode}
                trackColor={{ false: '#d1d1d1', true: '#ffccbc' }}
                thumbColor={
                  profile.notifications.newBooking ? '#FF5722' : '#f4f3f4'
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons name="refresh-outline" size={18} color="#666" />
                <Text style={styles.switchLabelText}>Booking Updates</Text>
              </View>
              <Switch
                value={profile.notifications.bookingUpdates}
                onValueChange={() => toggleNotification('bookingUpdates')}
                disabled={!editMode}
                trackColor={{ false: '#d1d1d1', true: '#ffccbc' }}
                thumbColor={
                  profile.notifications.bookingUpdates ? '#FF5722' : '#f4f3f4'
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons name="chatbubble-outline" size={18} color="#666" />
                <Text style={styles.switchLabelText}>Messages</Text>
              </View>
              <Switch
                value={profile.notifications.messages}
                onValueChange={() => toggleNotification('messages')}
                disabled={!editMode}
                trackColor={{ false: '#d1d1d1', true: '#ffccbc' }}
                thumbColor={
                  profile.notifications.messages ? '#FF5722' : '#f4f3f4'
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons name="megaphone-outline" size={18} color="#666" />
                <Text style={styles.switchLabelText}>
                  Marketing & Promotions
                </Text>
              </View>
              <Switch
                value={profile.notifications.marketing}
                onValueChange={() => toggleNotification('marketing')}
                disabled={!editMode}
                trackColor={{ false: '#d1d1d1', true: '#ffccbc' }}
                thumbColor={
                  profile.notifications.marketing ? '#FF5722' : '#f4f3f4'
                }
              />
            </View>
          </View>

          {editMode && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  fetchProfile()
                  setEditMode(false)
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!editMode && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#F44336" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  coverImageContainer: {
    position: 'relative',
    height: 180,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  logoContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderLogo: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLogoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5722',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    padding: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabelText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingLeft: 26,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabelText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F44336',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    marginLeft: 8,
  },
})

export default CompanyProfileScreen
