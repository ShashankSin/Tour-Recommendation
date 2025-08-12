'use client'

import React, { useEffect, useRef } from 'react'
import { Animated, ViewProps } from 'react-native'

// Animation types
export type AnimationType =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounceIn'
  | 'none'

interface AnimatedViewProps extends ViewProps {
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  style?: any;
  children?: React.ReactNode;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  style,
  children,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current // Use useRef to keep the value constant

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true, // Native driver helps improve performance
    }).start()
  }, [animatedValue, duration, delay])

  const getAnimationStyle = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        }
      case 'slideUp':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }
      case 'slideDown':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }
      case 'slideLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }
      case 'slideRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }
      case 'scaleOut':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1.2, 1],
              }),
            },
          ],
        }
      case 'bounceIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.4, 0.8, 1],
                outputRange: [0.3, 1.1, 0.9, 1],
              }),
            },
          ],
        }
      default:
        return {}
    }
  }

  return (
    <Animated.View style={[style, getAnimationStyle()]} {...props}>
      {children}
    </Animated.View>
  )
}

export default AnimatedView
