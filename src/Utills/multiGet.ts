import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugAsyncStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const data = await AsyncStorage.multiGet(keys);
  console.log("📦 AsyncStorage:", data);
};
