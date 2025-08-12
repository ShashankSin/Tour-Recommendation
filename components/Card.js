import { View, StyleSheet, TouchableOpacity } from 'react-native'
import AnimatedView from './AnimatedView'

const Card = ({
  children,
  onPress,
  style,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  ...props
}) => {
  const CardComponent = onPress ? TouchableOpacity : View

  return (
    <AnimatedView
      animation={animation}
      duration={duration}
      delay={delay}
      style={[styles.container, style]}
      {...props}
    >
      <CardComponent style={styles.card} onPress={onPress} activeOpacity={0.9}>
        {children}
      </CardComponent>
    </AnimatedView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
})

export default Card
