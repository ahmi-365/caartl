import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

const BottomNavigation = () => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Image 
            source={{ uri: 'https://static.codia.ai/image/2025-10-21/0neuZeUgD8.png' }}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image 
            source={{ uri: 'https://static.codia.ai/image/2025-10-21/SCZREaHfx6.png' }}
            style={styles.searchIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image 
            source={{ uri: 'https://static.codia.ai/image/2025-10-21/oLOg37ttsF.png' }}
            style={styles.profileIcon}
            resizeMode="contain"
          />
          <Image 
            source={{ uri: 'https://static.codia.ai/image/2025-10-21/N4mu33jAcq.png' }}
            style={styles.overlayIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 26,
    right: 26,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.79)',
    borderRadius: 44,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  homeIcon: {
    width: 34,
    height: 34,
  },
  searchIcon: {
    width: 26,
    height: 26,
  },
  profileIcon: {
    width: 26,
    height: 26,
  },
  overlayIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
  },
});

export default BottomNavigation;
