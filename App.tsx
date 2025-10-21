import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync(); // 👈 ensures splash stays until fonts load

export default function App() {
  const [fontsLoaded] = useFonts({
    Borg9: require("./assets/fonts/Borg9.ttf"), // 👈 your custom font
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // 👈 hide splash after fonts loaded
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // 👈 render nothing until font is ready
  }

  return (
    <ThemeProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
