import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import DropDownPicker from 'react-native-dropdown-picker'
import MapView, { Marker, Polyline } from 'react-native-maps'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

const initialTrekState = {
  title: '',
  location: '',
  description: '',
  duration: '',
  price: '',
  difficulty: 'moderate',
  category: 'hiking',
  images: [],
  itinerary: [{ day: 1, title: '', description: '' }],
  inclusions: [''],
  route: [],
}

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Difficult', value: 'difficult' },
  { label: 'Extreme', value: 'extreme' },
]

const categoryOptions = [
  { label: 'Hiking', value: 'hiking' },
  { label: 'Trekking', value: 'trekking' },
  { label: 'Mountain Climbing', value: 'mountain-climbing' },
  { label: 'Camping', value: 'camping' },
  { label: 'Wildlife Safari', value: 'wildlife-safari' },
]

function CompanyItinerariesScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState('myTreks')
  const [loading, setLoading] = useState(false)
  const [treks, setTreks] = useState([])
  const [trekForm, setTrekForm] = useState(initialTrekState)

  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const [formStep, setFormStep] = useState(1)

  const [mapVisible, setMapVisible] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    //! Fetch company treks on component mount
    fetchCompanyTreks(setTreks, setLoading)
  }, [])

  const fetchCompanyTreks = async (setTreks, setLoading) => {
    setLoading(true)

    try {
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setLoading(false)
        return
      }

      const decoded = jwtDecode(token)
      console.log('Decoded token:', decoded) // For debug

      const userId = decoded.id
      if (!userId) throw new Error('User ID not found in token')

      const response = await fetch('http://10.0.2.2:5000/api/trek/all', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setTreks(data.treks)
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch treks')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      Alert.alert('Error', error.message || 'Failed to fetch treks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrek = async () => {
    setLoading(true)
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token')
      const decoded = jwtDecode(token)
      const userId = decoded.id
      if (!userId) {
        throw new Error('User ID not found in token')
      }
      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setLoading(false)
        return
      }
      // Validate form
      if (
        !trekForm.title ||
        !trekForm.location ||
        !trekForm.description ||
        !trekForm.duration ||
        !trekForm.price
      ) {
        Alert.alert('Error', 'Please fill all required fields')
        setLoading(false)
        return
      }

      // API call to create the trek
      const response = await fetch('http://10.0.2.2:5000/api/trek/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Replace with real token
        },
        body: JSON.stringify(trekForm),
      })
      const data = await response.json()

      if (response.ok) {
        Alert.alert(
          'Success',
          'Trek created successfully and sent for approval.'
        )
        setTrekForm(initialTrekState)
        setFormStep(1)
        setActiveTab('myTreks')
        fetchCompanyTreks()
      } else {
        Alert.alert('Error', data.message || 'Trek creation failed')
      }

      // Mock success for demonstration
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Trek created successfully! It will be reviewed by an admin.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTrekForm(initialTrekState)
                setFormStep(1)
                setActiveTab('myTreks')
                fetchCompanyTreks()
              },
            },
          ]
        )
        setLoading(false)
      }, 1500)
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create trek')
      setLoading(false)
    }
  }

  const handleDeleteTrek = (trekId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this trek?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              const token = await AsyncStorage.getItem('token') // Adjust key if you used a different one
              const decoded = jwtDecode(token)
              // API call would go here
              await fetch(`http://10.0.2.2:5000/api/trek/delete/${trekId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })

              // Mock success for demonstration
              setTimeout(() => {
                setTreks(treks.filter((trek) => trek._id !== trekId))
                setLoading(false)
                Alert.alert('Success', 'Trek deleted successfully')
              }, 1000)
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trek')
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleEditPress = (trekId) => {
    navigation.navigate('EditItinerary', { trekId }) // Only pass ID
    console.log('Editing trek with ID:', trekId)
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, //! Changed from ImagePicker.MediaType.Images
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      })

      if (!result.canceled) {
        setTrekForm({
          ...trekForm,
          images: [...trekForm.images, result.assets[0].uri],
        })
      }
    } catch (error) {
      console.error('Image picker error:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const addItineraryDay = () => {
    const newDay = {
      day: trekForm.itinerary.length + 1,
      title: '',
      description: '',
    }
    setTrekForm({
      ...trekForm,
      itinerary: [...trekForm.itinerary, newDay],
    })
  }

  const updateItineraryDay = (index, field, value) => {
    const updatedItinerary = [...trekForm.itinerary]
    updatedItinerary[index] = {
      ...updatedItinerary[index],
      [field]: value,
    }
    setTrekForm({
      ...trekForm,
      itinerary: updatedItinerary,
    })
  }

  const addInclusion = () => {
    setTrekForm({
      ...trekForm,
      inclusions: [...trekForm.inclusions, ''],
    })
  }

  const updateInclusion = (index, value) => {
    const updatedInclusions = [...trekForm.inclusions]
    updatedInclusions[index] = value
    setTrekForm({
      ...trekForm,
      inclusions: updatedInclusions,
    })
  }

  const removeInclusion = (index) => {
    const updatedInclusions = [...trekForm.inclusions]
    updatedInclusions.splice(index, 1)
    setTrekForm({
      ...trekForm,
      inclusions: updatedInclusions,
    })
  }

  const addRoutePoint = (event) => {
    const { coordinate } = event.nativeEvent
    setTrekForm({
      ...trekForm,
      route: [
        ...trekForm.route,
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        },
      ],
    })
  }

  const clearRoute = () => {
    setTrekForm({
      ...trekForm,
      route: [],
    })
  }

  const renderTrekItem = ({ item }) => (
    <View style={styles.trekCard}>
      <Image
        source={{
          uri: item.images[0] || '/placeholder.svg?height=200&width=300',
        }}
        style={styles.trekImage}
      />
      <View style={styles.trekDetails}>
        <Text style={styles.trekTitle}>{item.title}</Text>
        <Text style={styles.trekLocation}>
          <Ionicons name="location" size={16} color="#666" /> {item.location}
        </Text>
        <View style={styles.trekMeta}>
          <Text style={styles.trekMetaItem}>
            <Ionicons name="calendar" size={14} color="#666" /> {item.duration}{' '}
            days
          </Text>
          <Text style={styles.trekMetaItem}>
            <Ionicons name="cash" size={14} color="#666" /> NPR {item.price}
          </Text>
          <Text
            style={[
              styles.trekMetaItem,
              { color: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Ionicons
              name="trending-up"
              size={14}
              color={getDifficultyColor(item.difficulty)}
            />
            {capitalizeFirstLetter(item.difficulty)}
          </Text>
        </View>
        <View style={styles.trekStatus}>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isApproved ? '#e6f7e6' : '#fff3e0',
                color: item.isApproved ? '#2e7d32' : '#ef6c00',
              },
            ]}
          >
            {item.isApproved ? 'Approved' : 'Pending Approval'}
          </Text>
        </View>
        <View style={styles.trekActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditPress(item._id)} // Just navigate with ID
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTrek(item._id)}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Basic Information</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Trek title"
              value={trekForm.title}
              onChangeText={(text) => setTrekForm({ ...trekForm, title: text })}
            />

            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Trek location"
              value={trekForm.location}
              onChangeText={(text) =>
                setTrekForm({ ...trekForm, location: text })
              }
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed description of the trek"
              multiline
              numberOfLines={4}
              value={trekForm.description}
              onChangeText={(text) =>
                setTrekForm({ ...trekForm, description: text })
              }
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration (days) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duration"
                  keyboardType="numeric"
                  value={trekForm.duration}
                  onChangeText={(text) =>
                    setTrekForm({ ...trekForm, duration: text })
                  }
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Price (NPR) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={trekForm.price}
                  onChangeText={(text) =>
                    setTrekForm({ ...trekForm, price: text })
                  }
                />
              </View>
            </View>

            {/* ✅ DropDownPicker Fix with zIndex */}
            <View style={{ zIndex: 3000 }}>
              <Text style={styles.inputLabel}>Difficulty *</Text>
              <DropDownPicker
                open={difficultyOpen}
                value={trekForm.difficulty}
                items={difficultyOptions}
                setOpen={setDifficultyOpen}
                setValue={(callback) => {
                  setTrekForm((prev) => ({
                    ...prev,
                    difficulty: callback(prev.difficulty),
                  }))
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={{ zIndex: 2000 }}>
              <Text style={styles.inputLabel}>Category *</Text>
              <DropDownPicker
                open={categoryOpen}
                value={trekForm.category}
                items={categoryOptions}
                setOpen={setCategoryOpen}
                setValue={(callback) => {
                  setTrekForm((prev) => ({
                    ...prev,
                    category: callback(prev.category),
                  }))
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setFormStep(2)}
            >
              <Text style={styles.nextButtonText}>
                Next: Images & Itinerary
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Images & Itinerary</Text>

            <Text style={styles.inputLabel}>Trek Images</Text>
            <View style={styles.imagesContainer}>
              {trekForm.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.uploadedImage}
                />
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="add" size={24} color="#666" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Itinerary</Text>
            {trekForm.itinerary.map((day, index) => (
              <View key={index} style={styles.itineraryDay}>
                <Text style={styles.dayLabel}>Day {day.day}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Day title"
                  value={day.title}
                  onChangeText={(text) =>
                    updateItineraryDay(index, 'title', text)
                  }
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Day description"
                  multiline
                  numberOfLines={3}
                  value={day.description}
                  onChangeText={(text) =>
                    updateItineraryDay(index, 'description', text)
                  }
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addDayButton}
              onPress={addItineraryDay}
            >
              <Ionicons name="add-circle" size={18} color="#4CAF50" />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>

            <View style={styles.formNavigation}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setFormStep(1)}
              >
                <Ionicons name="arrow-back" size={16} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setFormStep(3)}
              >
                <Text style={styles.nextButtonText}>
                  Next: Inclusions & Route
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Inclusions & Route</Text>

            <Text style={styles.inputLabel}>Inclusions</Text>
            {trekForm.inclusions.map((inclusion, index) => (
              <View key={index} style={styles.inclusionItem}>
                <TextInput
                  style={[styles.input, styles.inclusionInput]}
                  placeholder="e.g., Accommodation, Meals, Guide"
                  value={inclusion}
                  onChangeText={(text) => updateInclusion(index, text)}
                />
                <TouchableOpacity
                  style={styles.removeInclusionButton}
                  onPress={() => removeInclusion(index)}
                >
                  <Ionicons name="close-circle" size={22} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addInclusionButton}
              onPress={addInclusion}
            >
              <Ionicons name="add-circle" size={18} color="#4CAF50" />
              <Text style={styles.addInclusionText}>Add Inclusion</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Trek Route</Text>
            <TouchableOpacity
              style={styles.mapToggleButton}
              onPress={() => setMapVisible(!mapVisible)}
            >
              <Ionicons
                name={mapVisible ? 'map' : 'map-outline'}
                size={18}
                color="#333"
              />
              <Text style={styles.mapToggleText}>
                {mapVisible ? 'Hide Map' : 'Show Map'}
              </Text>
            </TouchableOpacity>

            {mapVisible && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: 27.7172,
                    longitude: 85.324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={addRoutePoint}
                >
                  {trekForm.route.map((point, index) => (
                    <Marker
                      key={index}
                      coordinate={point}
                      title={
                        index === 0
                          ? 'Start'
                          : index === trekForm.route.length - 1
                          ? 'End'
                          : `Point ${index + 1}`
                      }
                    />
                  ))}
                  {trekForm.route.length > 1 && (
                    <Polyline
                      coordinates={trekForm.route}
                      strokeColor="#FF5722"
                      strokeWidth={3}
                    />
                  )}
                </MapView>

                <TouchableOpacity
                  style={styles.clearRouteButton}
                  onPress={clearRoute}
                >
                  <Text style={styles.clearRouteText}>Clear Route</Text>
                </TouchableOpacity>

                <Text style={styles.mapInstructions}>
                  Tap on the map to add route points
                </Text>
              </View>
            )}

            <View style={styles.formNavigation}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setFormStep(2)}
              >
                <Ionicons name="arrow-back" size={16} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateTrek}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Trek</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Company Itineraries</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myTreks' && styles.activeTab]}
          onPress={() => setActiveTab('myTreks')}
        >
          <Ionicons
            name={activeTab === 'myTreks' ? 'list' : 'list-outline'}
            size={20}
            color={activeTab === 'myTreks' ? '#FF5722' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'myTreks' && styles.activeTabText,
            ]}
          >
            My Treks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'createTrek' && styles.activeTab]}
          onPress={() => {
            setActiveTab('createTrek')
            setTrekForm(initialTrekState)
            setFormStep(1)
          }}
        >
          <Ionicons
            name={
              activeTab === 'createTrek' ? 'add-circle' : 'add-circle-outline'
            }
            size={20}
            color={activeTab === 'createTrek' ? '#FF5722' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'createTrek' && styles.activeTabText,
            ]}
          >
            Create Trek
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'myTreks' ? (
        <View style={styles.trekListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5722" />
              <Text style={styles.loadingText}>Loading treks...</Text>
            </View>
          ) : treks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trail-sign-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No treks found</Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => {
                  setActiveTab('createTrek')
                  setTrekForm(initialTrekState)
                  setFormStep(1)
                }}
              >
                <Text style={styles.createFirstButtonText}>
                  Create Your First Trek
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={treks}
              renderItem={renderTrekItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.trekList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.createTrekContainer}
            contentContainerStyle={styles.createTrekContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSteps}>
              <View
                style={[
                  styles.formStep,
                  formStep >= 1 && styles.activeFormStep,
                ]}
              >
                <Text style={styles.formStepText}>1</Text>
              </View>
              <View style={styles.formStepConnector} />
              <View
                style={[
                  styles.formStep,
                  formStep >= 2 && styles.activeFormStep,
                ]}
              >
                <Text style={styles.formStepText}>2</Text>
              </View>
              <View style={styles.formStepConnector} />
              <View
                style={[
                  styles.formStep,
                  formStep >= 3 && styles.activeFormStep,
                ]}
              >
                <Text style={styles.formStepText}>3</Text>
              </View>
            </View>

            {renderFormStep()}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  )
}
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return '#4CAF50'
    case 'moderate':
      return '#FF9800'
    case 'difficult':
      return '#F44336'
    case 'extreme':
      return '#9C27B0'
    default:
      return '#666'
  }
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF5722',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FF5722',
  },
  trekListContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trekList: {
    padding: 16,
  },
  trekCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  trekImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  trekDetails: {
    padding: 16,
  },
  trekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trekLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trekMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  trekMetaItem: {
    fontSize: 13,
    color: '#666',
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trekStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  trekActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  createTrekContainer: {
    flex: 1,
  },
  createTrekContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFormStep: {
    backgroundColor: '#FF5722',
  },
  formStepText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formStepConnector: {
    height: 2,
    width: 40,
    backgroundColor: '#e0e0e0',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: '#ddd',
  },
  nextButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    margin: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itineraryDay: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF5722',
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addDayText: {
    marginLeft: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
  formNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  backButtonText: {
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inclusionInput: {
    flex: 1,
    marginBottom: 8,
  },
  removeInclusionButton: {
    marginLeft: 8,
    marginBottom: 8,
  },
  addInclusionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addInclusionText: {
    marginLeft: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapToggleText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '500',
  },
  clearRouteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  clearRouteText: {
    color: '#F44336',
    fontWeight: '500',
    fontSize: 12,
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
})

export default CompanyItinerariesScreen
