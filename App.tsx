import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AlertProvider } from "./src/context/AlertContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from 'expo-navigation-bar';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Borg9: require("./assets/fonts/Borg9.ttf"),
  });

  useEffect(() => {
    const prepare = async () => {
      if (Platform.OS === 'android') {
        // Set bar to black and visible
        await NavigationBar.setBackgroundColorAsync("#000000");
        await NavigationBar.setButtonStyleAsync("light");
        await NavigationBar.setVisibilityAsync("visible"); // Ensure it's visible
      }

      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AlertProvider>
              <AppNavigator />
              <StatusBar style="light" backgroundColor="#000000" />
            </AlertProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}