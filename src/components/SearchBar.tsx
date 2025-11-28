import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SearchBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/pnFPZiUkgC.png' }}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <Text style={styles.placeholder}>Search for Honda Pilot 7-Passenger</Text>
      </View>
      <Image
        source={{ uri: 'https://static.codia.ai/image/2025-10-21/9FbBdSeWEw.png' }}
        style={styles.filterIcon}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    marginTop: 15,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEEEF',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 27,
    marginRight: 15,
  },
  searchIcon: {
    width: 30,
    height: 25,
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
    fontSize: 12,
    color: '#8C9199',
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  filterIcon: {
    width: 27,
    height: 18,
  },
});

export default SearchBar;
