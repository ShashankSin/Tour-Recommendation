import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AnimatedHeader = ({
  title,
  scrollY,
  navigation,
  showBackButton = true,
  rightComponent,
  colors = ['#2563eb', '#3b82f6'],
  expandedHeight = 200,
  collapsedHeight = 70,
}) => {
  const insets = useSafeAreaInsets()

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, expandedHeight - collapsedHeight],
    outputRange: [expandedHeight, collapsedHeight],
    extrapolate: 'clamp',
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, expandedHeight - collapsedHeight],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  })

  const titleOpacity = scrollY.interpolate({
    inputRange: [
      0,
      (expandedHeight - collapsedHeight) * 0.6,
      expandedHeight - collapsedHeight,
    ],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  })

  const titleScale = scrollY.interpolate({
    inputRange: [0, expandedHeight - collapsedHeight],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  })

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, expandedHeight - collapsedHeight],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          opacity: headerOpacity,
          paddingTop: insets.top,
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          {/* Back Button */}
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [
                  { scale: titleScale },
                  { translateY: titleTranslateY },
                ],
              },
            ]}
          >
            <Text style={styles.title}>{title}</Text>
          </Animated.View>

          {/* Right Component */}
          {rightComponent && (
            <View style={styles.rightComponent}>{rightComponent}</View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightComponent: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
})

export default AnimatedHeader
