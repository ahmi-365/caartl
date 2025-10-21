import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from "react-native";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { HomescreenLight } from "../screens/Caartl/homescreen"; 
import { SplashScreenDark } from "../screens/SplashScreenDark"; 


// Navigator Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined; // This likely points to your BottomTabNavigator
  ChangePassword: undefined;
  EditProfile: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreenDark} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomescreenLight} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#cadb2a", 
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },
});