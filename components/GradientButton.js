import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const GradientButton = ({
  onPress,
  title,
  colors = ['#2563eb', '#1d4ed8'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  loading = false,
  disabled = false,
  textColor = 'white',
  style,
  textStyle,
  icon,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, disabled && styles.disabled, style]}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <React.Fragment>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {title}
            </Text>
          </React.Fragment>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
  },
})

export default GradientButton
