'use client'

import { useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native'

const { height } = Dimensions.get('window')

const BottomSheet = ({
  isVisible,
  onClose,
  children,
  snapPoints = [0, height * 0.5, height * 0.9],
  initialSnapIndex = 1,
  backgroundColor = 'white',
  handleColor = '#e2e8f0',
}) => {
  const translateY = useRef(new Animated.Value(height)).current
  const currentSnapPoint = useRef(snapPoints[initialSnapIndex])

  useEffect(() => {
    if (isVisible) {
      // Open to initial snap point
      Animated.spring(translateY, {
        toValue: snapPoints[initialSnapIndex],
        useNativeDriver: true,
        bounciness: 4,
      }).start()
    } else {
      // Close
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isVisible])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = currentSnapPoint.current + gestureState.dy
        if (newPosition >= snapPoints[snapPoints.length - 1]) {
          translateY.setValue(newPosition)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Find the closest snap point
        let closestSnapPoint = snapPoints[0]
        let minDistance = Math.abs(
          currentSnapPoint.current + gestureState.dy - snapPoints[0]
        )

        for (let i = 1; i < snapPoints.length; i++) {
          const distance = Math.abs(
            currentSnapPoint.current + gestureState.dy - snapPoints[i]
          )
          if (distance < minDistance) {
            minDistance = distance
            closestSnapPoint = snapPoints[i]
          }
        }

        // If swiping up fast, go to next snap point up
        if (
          gestureState.vy < -0.5 &&
          closestSnapPoint !== snapPoints[snapPoints.length - 1]
        ) {
          const currentIndex = snapPoints.indexOf(closestSnapPoint)
          closestSnapPoint = snapPoints[currentIndex + 1]
        }

        // If swiping down fast, go to next snap point down
        if (gestureState.vy > 0.5 && closestSnapPoint !== snapPoints[0]) {
          const currentIndex = snapPoints.indexOf(closestSnapPoint)
          closestSnapPoint = snapPoints[currentIndex - 1]
        }

        // If closest snap point is the bottom, close the sheet
        if (closestSnapPoint === snapPoints[0]) {
          onClose()
        }

        // Animate to the closest snap point
        Animated.spring(translateY, {
          toValue: closestSnapPoint,
          useNativeDriver: true,
          bounciness: 4,
        }).start()

        currentSnapPoint.current = closestSnapPoint
      },
    })
  ).current

  if (!isVisible) return null

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.background} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.header} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
    maxHeight: height * 0.9,
  },
  header: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  content: {
    padding: 16,
  },
})

export default BottomSheet
