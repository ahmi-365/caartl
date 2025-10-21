import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton}>
        <Image 
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/fCRwFJMp2Z.png' }}
          style={styles.menuIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      <Text style={styles.logo}>caartI</Text>
      
      <TouchableOpacity style={styles.iconButton}>
        <Image 
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/LMpHjqOuiT.png' }}
          style={styles.bellIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 16,
    height: 56,
    backgroundColor: '#ffffff',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 25,
    height: 24,
  },
  bellIcon: {
    width: 25,
    height: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: '#CADB2A',
    letterSpacing: -0.41,
    textAlign: 'center',
  },
});

export default Header;
