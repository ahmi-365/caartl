import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Input } from '../components/ui/input';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator'; 
import {  NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;


  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Background Images */}
      <ImageBackground
        source={{ uri: 'https://static.codia.ai/image/2025-10-20/hFdUGzMbu5.png' }}
        style={styles.topBackground}
        resizeMode="cover"
      />
      <ImageBackground
        source={{ uri: 'https://static.codia.ai/image/2025-10-20/W7Czw6Ls88.png' }}
        style={styles.bottomBackground}
        resizeMode="cover"
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-20/3PcrpRUpQR.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Login to your account using email{'\n'}or social networks!
          </Text>
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: 'https://static.codia.ai/image/2025-10-20/0cbxiA4x1a.png' }}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="rgba(0, 0, 0, 0.37)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* Password Input */}
        {/* Password Input */}
<View style={styles.inputContainer}>
  <Image
    source={{ uri: 'https://static.codia.ai/image/2025-10-20/ehk1tymwRT.png' }}
    style={styles.passwordIcon}
    resizeMode="contain"
  />

  <Input
    placeholder="Password"
    secureTextEntry
    keyboardType="default"
    autoCapitalize="none"
  />

  <Image
    source={{ uri: 'https://static.codia.ai/image/2025-10-20/csxGWWJ4GP.png' }}
    style={styles.eyeIcon}
    resizeMode="contain"
  />
</View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}
          onPress={() => navigation.navigate('Home')}
>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        
        {/* Sign Up Link */}
      <TouchableOpacity
  style={styles.signUpContainer}
  onPress={() => navigation.navigate('Register')}
>
  <Text style={styles.signUpText}>
    First Time Here? <Text style={styles.signUpLink}>Sign up</Text>
  </Text>
</TouchableOpacity>

        
        {/* Or Sign In With */}
{/* Or Sign In With */}
<View style={styles.orContainer}>
  <View style={styles.separatorLine} />
  <Text style={styles.orSignInText}>Or sign in with</Text>
  <View style={styles.separatorLine} />
</View>
        
        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://static.codia.ai/image/2025-10-20/fh6mQRqw2B.png' }}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://static.codia.ai/image/2025-10-20/7VKktezyri.png' }}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.5,
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: height * 0.45,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 70,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 65,
    marginBottom: 25,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontFamily: 'Borg9',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    // paddingVertical: 14,d
    marginBottom: 20,
    width: '100%',
    height: 55,
  },
  inputIcon: {
    width: 22,
    height: 18,
    marginRight: 15,
  },
  passwordIcon: {
    width: 14,
    height: 18,
    marginRight: 18,
  },
  eyeIcon: {
    width: 20,
    height: 14,
    marginLeft: 'auto',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 18,
    paddingVertical: 15,
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  signUpContainer: {
    marginBottom: 18,
  },
  signUpText: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#CADB2A',
  },
orContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  marginBottom: 18,
},

separatorLine: {
  flex: 1,
  height: 1,
  backgroundColor: '#FFFFFF',
  opacity: 0.5,
  marginHorizontal: 8,
},

orSignInText: {
  fontFamily: 'Baloo Thambi 2',
  fontSize: 16,
  color: '#FFFFFF',
  textAlign: 'center',
},

  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    height: 40,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
});


export default LoginScreen;
