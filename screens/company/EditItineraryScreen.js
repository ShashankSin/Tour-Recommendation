import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import DropDownPicker from 'react-native-dropdown-picker'
import MapView, { Marker, Polyline } from 'react-native-maps'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

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

function EditItineraryScreen({ route, navigation }) {
  const { trekId } = route.params

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formStep, setFormStep] = useState(1)

  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const [mapVisible, setMapVisible] = useState(false)

  const [form, setForm] = useState({
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
  })
  //! Fetch existing itinerary
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const token = await AsyncStorage.getItem('token')

        const response = await axios.get(
          `http://10.0.2.2:5000/api/trek/itinerary/${trekId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = response.data
        console.log('Fetched Data:', data)
        const trek = data.trek
        setForm({
          title: trek.title ?? '',
          location: trek.location ?? '',
          description: trek.description ?? '',
          duration: String(trek.duration ?? ''),
          price: String(trek.price ?? ''),
          difficulty: trek.difficulty ?? 'moderate',
          category: trek.category ?? 'hiking',
          images: trek.images ?? [],

          itinerary: trek.itinerary?.map((d, i) => ({
            day: d.day ?? i + 1,
            title: d.title ?? '',
            description: d.description ?? '',
          })) ?? [{ day: 1, title: '', description: '' }],

          inclusions: trek.inclusions?.length ? trek.inclusions : [''],
          route: trek.route ?? [],

          companyName: trek.companyId?.name ?? '',
          rating: trek.rating ?? '',
          ratingCount: trek.ratingCount ?? '',
          updatedAt: trek.updatedAt ?? '',
        })
      } catch (error) {
        console.error('Error fetching itinerary:', error)
        Alert.alert('Error', 'Failed to load itinerary.')
      } finally {
        setLoading(false)
      }
    }

    fetchItinerary()
  }, [trekId])

  const handleInputChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    if (
      !form.title ||
      !form.location ||
      !form.description ||
      !form.duration ||
      !form.price
    ) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    try {
      setUpdating(true)
      const token = await AsyncStorage.getItem('token')

      await axios.put(
        `http://10.0.2.2:5000/api/trek/update/${trekId}`,
        {
          ...form,
          duration: Number(form.duration),
          price: Number(form.price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      Alert.alert('Success', 'Itinerary updated successfully!')
      navigation.goBack()
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message)
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to update itinerary.'
      )
    } finally {
      setUpdating(false)
    }
  }

  //! image Picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      })

      if (!result.canceled) {
        setForm({
          ...form,
          images: [...form.images, result.assets[0].uri],
        })
      }
    } catch (error) {
      console.error('Image picker error:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const removeImage = (index) => {
    const updatedImages = [...form.images]
    updatedImages.splice(index, 1)
    setForm({
      ...form,
      images: updatedImages,
    })
  }

  const addItineraryDay = () => {
    const newDay = {
      day: form.itinerary.length + 1,
      title: '',
      description: '',
    }
    setForm({
      ...form,
      itinerary: [...form.itinerary, newDay],
    })
  }

  const updateItineraryDay = (index, field, value) => {
    const updatedItinerary = [...form.itinerary]
    updatedItinerary[index] = {
      ...updatedItinerary[index],
      [field]: value,
    }
    setForm({
      ...form,
      itinerary: updatedItinerary,
    })
  }

  const removeItineraryDay = (index) => {
    if (form.itinerary.length > 1) {
      const updatedItinerary = [...form.itinerary]
      updatedItinerary.splice(index, 1)
      updatedItinerary.forEach((day, idx) => {
        day.day = idx + 1
      })
      setForm({
        ...form,
        itinerary: updatedItinerary,
      })
    }
  }

  const addInclusion = () => {
    setForm({
      ...form,
      inclusions: [...form.inclusions, ''],
    })
  }

  const updateInclusion = (index, value) => {
    const updatedInclusions = [...form.inclusions]
    updatedInclusions[index] = value
    setForm({
      ...form,
      inclusions: updatedInclusions,
    })
  }

  const removeInclusion = (index) => {
    if (form.inclusions.length > 1) {
      const updatedInclusions = [...form.inclusions]
      updatedInclusions.splice(index, 1)
      setForm({
        ...form,
        inclusions: updatedInclusions,
      })
    }
  }

  const addRoutePoint = (event) => {
    const { coordinate } = event.nativeEvent
    setForm({
      ...form,
      route: [
        ...form.route,
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        },
      ],
    })
  }

  const clearRoute = () => {
    setForm({
      ...form,
      route: [],
    })
  }

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
              value={form.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />

            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Trek location"
              value={form.location}
              onChangeText={(text) => handleInputChange('location', text)}
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed description of the trek"
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration (days) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duration"
                  keyboardType="numeric"
                  value={form.duration}
                  onChangeText={(text) => handleInputChange('duration', text)}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Price (NPR) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(text) => handleInputChange('price', text)}
                />
              </View>
            </View>

            <View style={{ zIndex: 3000 }}>
              <Text style={styles.inputLabel}>Difficulty *</Text>
              <DropDownPicker
                open={difficultyOpen}
                value={form.difficulty}
                items={difficultyOptions}
                setOpen={setDifficultyOpen}
                setValue={(callback) => {
                  setForm((prev) => ({
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
                value={form.category}
                items={categoryOptions}
                setOpen={setCategoryOpen}
                setValue={(callback) => {
                  setForm((prev) => ({
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
              {form.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
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
            {form.itinerary.map((day, index) => (
              <View key={index} style={styles.itineraryDay}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>Day {day.day}</Text>
                  {form.itinerary.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeDayButton}
                      onPress={() => removeItineraryDay(index)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  )}
                </View>

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
            {form.inclusions.map((inclusion, index) => (
              <View key={index} style={styles.inclusionItem}>
                <TextInput
                  style={[styles.input, styles.inclusionInput]}
                  placeholder="e.g., Accommodation, Meals, Guide"
                  value={inclusion}
                  onChangeText={(text) => updateInclusion(index, text)}
                />
                {form.inclusions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeInclusionButton}
                    onPress={() => removeInclusion(index)}
                  >
                    <Ionicons name="close-circle" size={22} color="#F44336" />
                  </TouchableOpacity>
                )}
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
                    latitude: form.route[0]?.latitude || 27.7172,
                    longitude: form.route[0]?.longitude || 85.324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={addRoutePoint}
                >
                  {form.route.map((point, index) => (
                    <Marker
                      key={index}
                      coordinate={point}
                      title={
                        index === 0
                          ? 'Start'
                          : index === form.route.length - 1
                          ? 'End'
                          : `Point ${index + 1}`
                      }
                    />
                  ))}
                  {form.route.length > 1 && (
                    <Polyline
                      coordinates={form.route}
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
                style={styles.updateButton}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.updateButtonText}>
                      Update Itinerary
                    </Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading itinerary...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backHeaderButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Itinerary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSteps}>
            <View
              style={[styles.formStep, formStep >= 1 && styles.activeFormStep]}
            >
              <Text style={styles.formStepText}>1</Text>
            </View>
            <View style={styles.formStepConnector} />
            <View
              style={[styles.formStep, formStep >= 2 && styles.activeFormStep]}
            >
              <Text style={styles.formStepText}>2</Text>
            </View>
            <View style={styles.formStepConnector} />
            <View
              style={[styles.formStep, formStep >= 3 && styles.activeFormStep]}
            >
              <Text style={styles.formStepText}>3</Text>
            </View>
          </View>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 50,
              }}
            >
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={{ marginTop: 10 }}>Loading itinerary...</Text>
            </View>
          ) : (
            renderFormStep()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  backHeaderButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
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
  imageWrapper: {
    position: 'relative',
    margin: 4,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  removeDayButton: {
    padding: 4,
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
  updateButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
})

export default EditItineraryScreen
