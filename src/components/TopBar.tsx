import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = theme === 'dark';

  const showLogout = !['Login', 'Register'].includes(route.name);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          });
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1c1c1e' : '#ffffff', shadowColor: isDark ? '#000' : '#aaa' },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={isDark ? '#a855f7' : '#333'}
          />
        </TouchableOpacity>

        {showLogout && (
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color={isDark ? '#a855f7' : '#333'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    marginLeft: 12,
  },
});
