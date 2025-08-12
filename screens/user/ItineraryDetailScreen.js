import { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
const { width, height } = Dimensions.get('window')

const ItineraryDetailScreen = ({ navigation }) => {
  const route = useRoute()
  const { itineraryId } = route.params

  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const scrollY = useRef(new Animated.Value(0)).current
  const scrollX = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef(null)

  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / width)
      setActiveImageIndex(index)
    })

    return () => {
      scrollX.removeListener(listener)
    }
  }, [scrollX])

  const fetchItinerary = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://10.0.2.2:5000/api/trek/public/itinerary/${itineraryId}`
      )

      if (response.data) {
        setItinerary(response.data)
        // Check if itinerary is in wishlist
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
          const wishlistResponse = await axios.get(
            `http://10.0.2.2:5000/api/wishlist/check/${itineraryId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          setIsInWishlist(wishlistResponse.data.isInWishlist)
        }
      } else {
        throw new Error('Failed to fetch itinerary')
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error.response?.data || error)
      setError(error.response?.data?.message || 'Failed to fetch itinerary')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const token = await AsyncStorage.getItem('userToken')
      const response = await axios.get(
        `http://10.0.2.2:5000/api/review/trek/${itineraryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data) {
        setReviews(response.data.reviews || [])
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error.response?.data || error)
      setReviews([])
      setError('Failed to fetch reviews')
    } finally {
      setReviewsLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return

      setWishlistLoading(true)
      const response = await axios.get(
        `http://10.0.2.2:5000/api/wishlist/check/${itineraryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setIsInWishlist(response.data.isInWishlist)
    } catch (err) {
      console.error('Error checking wishlist status:', err.message)
    } finally {
      setWishlistLoading(false)
    }
  }

  const toggleWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please login to add items to your wishlist',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigation.navigate('Login') },
          ]
        )
        return
      }

      setWishlistLoading(true)

      if (isInWishlist) {
        await axios.delete(
          `http://10.0.2.2:5000/api/wishlist/remove/${itineraryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setIsInWishlist(false)
      } else {
        await axios.post(
          `http://10.0.2.2:5000/api/wishlist/add`,
          { trekId: itineraryId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setIsInWishlist(true)
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err.message)
      Alert.alert('Error', 'Failed to update wishlist. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }

  const submitReview = async () => {
    try {
      setReviewSubmitting(true)
      const token = await AsyncStorage.getItem('userToken')
      const decoded = jwtDecode(token)
      const userId = decoded.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      if (!itinerary?._id) {
        throw new Error('Itinerary information not available')
      }

      const response = await axios.post(
        'http://10.0.2.2:5000/api/review/create',
        {
          trekId: itineraryId,
          userId: userId,
          companyId: itinerary.companyId,
          rating: rating,
          comment: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        Alert.alert('Success', 'Review submitted successfully')
        setReviewModalVisible(false)
        setReviewText('')
        setRating(5)
        fetchReviews()
      } else {
        throw new Error(response.data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Submit review error:', error.response?.data || error)
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit review'
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  useEffect(() => {
    fetchItinerary()
    fetchReviews()
    checkWishlistStatus()
  }, [itineraryId])

  const handleBooking = async () => {
    const token = await AsyncStorage.getItem('token')
    console.log('Token:', token)
    console.log('Trek ID:', itineraryId)
    navigation.navigate('Booking', { trekId: itineraryId })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading your adventure...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#f97316" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true)
            setError('')
            fetchItinerary()
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!itinerary) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-text-outline" size={64} color="#f97316" />
        <Text style={styles.errorText}>No itinerary data found.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {itinerary.title}
        </Text>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={toggleWishlist}
          disabled={wishlistLoading}
        >
          {wishlistLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color="white"
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          {itinerary.images && itinerary.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
              >
                {itinerary.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.paginationContainer}>
                {itinerary.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex
                        ? styles.paginationDotActive
                        : styles.paginationDotInactive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={64} color="#f97316" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={20} color="white" />
          </TouchableOpacity>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={toggleWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={20}
                color="white"
              />
            )}
          </TouchableOpacity>

          {/* Price Badge */}
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priceBadge}
          >
            <Text style={styles.priceText}>NPR {itinerary.price}</Text>
          </LinearGradient>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title and Location */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{itinerary.title}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color="#f97316" />
              <Text style={styles.locationText}>{itinerary.location}</Text>
            </View>
          </View>

          {/* Rating and Reviews Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    star <= (itinerary.rating || 4.8) ? 'star' : 'star-outline'
                  }
                  size={18}
                  color="#f97316"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {itinerary.rating || '4.8'} • {reviews.length || '0'} reviews
            </Text>
          </View>

          {/* Key Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#f97316" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{itinerary.duration} days</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="people-outline" size={20} color="#f97316" />
              </View>
              <Text style={styles.detailLabel}>Group Size</Text>
              <Text style={styles.detailValue}>
                {itinerary.groupSize || '2-10'}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#f97316"
                />
              </View>
              <Text style={styles.detailLabel}>Difficulty</Text>
              <Text style={styles.detailValue}>
                {itinerary.difficulty || 'Moderate'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.descriptionText}>{itinerary.description}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightsContainer}>
              {[
                'Stunning mountain views',
                'Local cultural experiences',
                'Professional guides',
                'Comfortable lodging',
              ].map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Itinerary Timeline */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Day by Day Itinerary</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {itinerary.itinerary && itinerary.itinerary.length > 0 ? (
              <>
                {/* Show first 3 days only */}
                {itinerary.itinerary.slice(0, 3).map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.compactTimelineItem}
                    onPress={() => {
                      // In a real app, this would open a modal or navigate to a detailed view
                      alert(
                        `Day ${day.day}: ${day.title}\n\n${day.description}`
                      )
                    }}
                  >
                    <View style={styles.timelineDayBadge}>
                      <Text style={styles.timelineDayText}>{day.day}</Text>
                    </View>
                    <View style={styles.compactTimelineContent}>
                      <Text style={styles.timelineTitle} numberOfLines={1}>
                        {day.title}
                      </Text>
                      <Text
                        style={styles.timelineDescription}
                        numberOfLines={2}
                      >
                        {day.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                ))}

                {/* Show "View All Days" button if there are more than 3 days */}
                {itinerary.itinerary.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllDaysButton}
                    onPress={() => {
                      // In a real app, this would navigate to a full itinerary view
                      alert('View all days of the itinerary')
                    }}
                  >
                    <Text style={styles.viewAllDaysText}>
                      View All {itinerary.itinerary.length} Days
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#f97316" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.noDataText}>
                No itinerary details available
              </Text>
            )}
          </View>

          {/* Inclusions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.inclusionsContainer}>
              {itinerary.inclusions &&
                itinerary.inclusions.map((inc, index) => (
                  <View key={index} style={styles.inclusionItem}>
                    <View style={styles.inclusionIconContainer}>
                      <Ionicons name="checkmark" size={18} color="#f97316" />
                    </View>
                    <Text style={styles.inclusionText}>{inc.name}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <LinearGradient
                colors={['rgba(249, 115, 22, 0.1)', 'rgba(249, 115, 22, 0.2)']}
                style={styles.mapGradient}
              >
                <Ionicons name="map-outline" size={40} color="#f97316" />
                <Text style={styles.mapText}>Map view coming soon</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.writeReviewButton}
                  onPress={() => setReviewModalVisible(true)}
                >
                  <Ionicons name="create-outline" size={16} color="#f97316" />
                  <Text style={styles.writeReviewText}>Write a Review</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>

            {reviewsLoading ? (
              <View style={styles.reviewsLoadingContainer}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.reviewsLoadingText}>
                  Loading reviews...
                </Text>
              </View>
            ) : reviews.length > 0 ? (
              reviews.map((review, index) => (
                <View key={review._id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <View style={styles.reviewUserAvatar}>
                        <Text style={styles.reviewUserInitial}>
                          {review.userId?.name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewUserName}>
                          {review.userId?.name || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={16}
                          color="#f97316"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>
                  Be the first to share your experience
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>NPR {itinerary.price}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.ratingInputContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#f97316"
                    style={styles.ratingInputStar}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.reviewInputLabel}>Your Review</Text>
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={5}
              placeholder="Share your experience with this trek..."
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity
              style={styles.submitReviewButton}
              onPress={submitReview}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitReviewButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#f97316',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#f97316',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  imageGalleryContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 300,
  },
  noImageContainer: {
    width: width,
    height: 300,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#f97316',
    fontSize: 16,
    marginTop: 8,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    margin: 3,
    borderRadius: 5,
  },
  paginationDotActive: {
    width: 10,
    height: 10,
    backgroundColor: '#f97316',
  },
  paginationDotInactive: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 6,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: '#4b5563',
    fontSize: 14,
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  highlightsContainer: {
    marginTop: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#4b5563',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDayContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timelineConnector: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff8f0',
    borderRadius: 16,
    padding: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  inclusionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  inclusionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inclusionText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
  },
  mapGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#f97316',
    marginTop: 12,
    fontSize: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  writeReviewText: {
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  seeAllText: {
    color: '#f97316',
    fontWeight: '500',
  },
  reviewsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  reviewsLoadingText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f97316',
  },
  reviewUserInitial: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 20,
  },
  reviewUserName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewComment: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  noReviewsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  bookButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  compactTimelineContent: {
    flex: 1,
    marginRight: 8,
  },
  viewAllDaysButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  viewAllDaysText: {
    color: '#f97316',
    fontWeight: '600',
    marginRight: 8,
  },
  noDataText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 12,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ratingInputStar: {
    marginHorizontal: 8,
  },
  reviewInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitReviewButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default ItineraryDetailScreen
