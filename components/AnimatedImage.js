'use client'

import { useState } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native'

const AnimatedImage = ({
  source,
  style,
  resizeMode = 'cover',
  onPress,
  animationType = 'pulse',
  ...props
}) => {
  const [animation] = useState(new Animated.Value(0))
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)

    if (animationType === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else if (animationType === 'fadeIn') {
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } else if (animationType === 'scale') {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start()
    }
  }

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'pulse':
        return {
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              }),
            },
          ],
        }
      case 'fadeIn':
        return {
          opacity: animation,
        }
      case 'scale':
        return {
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: animation,
        }
      default:
        return {}
    }
  }

  const ImageComponent = onPress ? TouchableWithoutFeedback : View

  return (
    <ImageComponent onPress={onPress}>
      <Animated.View
        style={[styles.container, style, isLoaded && getAnimationStyle()]}
      >
        <Image
          source={source}
          style={styles.image}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          {...props}
        />
      </Animated.View>
    </ImageComponent>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})

export default AnimatedImage
