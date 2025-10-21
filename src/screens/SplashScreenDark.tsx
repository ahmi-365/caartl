import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Assuming this path is correct for your RootStackParamList definition
import type { RootStackParamList } from '../navigation/AppNavigator'; 

// Define the specific type for navigation within the Stack Navigator
type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreenDark = () => {
  // Cast useNavigation to the specific Stack Navigator type to expose 'replace'
  const navigation = useNavigation<SplashScreenNavigationProp>();

  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  const fadeAnim5 = useRef(new Animated.Value(0)).current;

  const translateY1 = useRef(new Animated.Value(-10)).current;
  const translateY2 = useRef(new Animated.Value(-10)).current;
  const translateY3 = useRef(new Animated.Value(-10)).current;
  const translateY4 = useRef(new Animated.Value(-10)).current;
  const translateY5 = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const createAnimation = (fadeAnim: Animated.Value, translateY: Animated.Value, delay: number) => {
      return Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.stagger(0, [
      createAnimation(fadeAnim1, translateY1, 200),
      createAnimation(fadeAnim2, translateY2, 400),
      createAnimation(fadeAnim3, translateY3, 600),
      createAnimation(fadeAnim4, translateY4, 800),
      createAnimation(fadeAnim5, translateY5, 1000),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(202,219,42,0)', 'rgba(0,0,0,0.74)']}
        style={styles.gradient}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim1,
            transform: [{ translateY: translateY1 }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://c.animaapp.com/mg9at66b0mN3Dy/img/image-1.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.carImageContainer,
          {
            opacity: fadeAnim2,
            transform: [{ translateY: translateY2 }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://c.animaapp.com/mg9at66b0mN3Dy/img/image-27.png' }}
          style={styles.carImage}
          resizeMode="cover"
        />
        <View style={styles.carOverlay} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.heading,
          {
            opacity: fadeAnim3,
            transform: [{ translateY: translateY3 }],
                  fontFamily: 'Borg9', // 👈 add this line

          },
        ]}
      >
        Lorem Ipsum,{'\n'}Dolor Sit Amet
      </Animated.Text>

  <Animated.Text
  style={[
    styles.description,
    {
      opacity: fadeAnim4,
      transform: [{ translateY: translateY4 }],
    },
  ]}
>
  Lorem ipsum dolor sit amet, consectetur{'\n'}adipiscing elit 1.
</Animated.Text>


      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim5,
            transform: [{ translateY: translateY5 }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          // CORRECTED: Added onPress handler and using 'replace'
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.buttonText}>Let's Go</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cadb2a',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.075,
    left: SCREEN_WIDTH * 0.125,
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.15,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  carImageContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.13,
    // left: 0,
    right: 140,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.635,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carOverlay: {
    position: 'absolute',
    bottom: 0,
    left: SCREEN_WIDTH * 0.42,
    width: SCREEN_WIDTH * 0.234,
    height: SCREEN_HEIGHT * 0.032,
    // backgroundColor: '#232325',
  },
 heading: {
  position: 'absolute',
  top: SCREEN_HEIGHT * 0.678,
  left: SCREEN_WIDTH * 0.089,
  fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
  fontWeight: '400',
  color: '#ffffff',
  fontSize: SCREEN_WIDTH * 0.075,   // 🔽 reduced from 0.08
  lineHeight: SCREEN_WIDTH * 0.088, // 🔽 reduced from 0.096
},

  description: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.778,
    left: SCREEN_WIDTH * 0.109,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    fontWeight: '400',
    color: '#ffffff',
    fontSize: SCREEN_WIDTH * 0.041,
    lineHeight: SCREEN_WIDTH * 0.057,
  },
  buttonContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.867,
    left: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.798,
    height: SCREEN_HEIGHT * 0.073,
  },
  button: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    fontWeight: '700',
    color: '#ffffff',
    fontSize: SCREEN_WIDTH * 0.045,
  },
});