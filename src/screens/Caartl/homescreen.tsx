import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LiveAuctionsSection } from './sections/Liveauction';
import { NegotiationsSection } from './sections/negotion';
import { UpcomingAuctionsSection } from './sections/upcomming';

export const HomescreenLight = ()=> {
  const [activeTab, setActiveTab] = useState('live');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [searchText, setSearchText] = useState('');

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Menu button pressed');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const handleSearchPress = () => {
    Alert.alert('Search', `Searching for: ${searchText || 'Honda Pilot 7-Passenger'}`);
  };

  const handleFilterPress = () => {
    Alert.alert('Filter', 'Filter options opened');
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleNavPress = (navId: string) => {
    setActiveNavItem(navId);
    Alert.alert('Navigation', `${navId} pressed`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return (
          <>
            <NegotiationsSection />
            <LiveAuctionsSection />
            <UpcomingAuctionsSection />
          </>
        );
      case 'upcoming':
        return (
          <>
            <UpcomingAuctionsSection />
            <UpcomingAuctionsSection />
          </>
        );
      case 'negotiations':
        return (
          <>
            <NegotiationsSection />
            <NegotiationsSection />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleMenuPress}
            activeOpacity={0.7}
            style={styles.headerButton}
          >
            <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
              <Path d="M0 2C0 0.895431 0.895431 0 2 0H20C21.1046 0 22 0.895431 22 2C22 3.10457 21.1046 4 20 4H2C0.895431 4 0 3.10457 0 2Z" fill="white"/>
              <Path d="M0 12C0 10.8954 0.895431 10 2 10H16C17.1046 10 18 10.8954 18 12C18 13.1046 17.1046 14 16 14H2C0.895431 14 0 13.1046 0 12Z" fill="white"/>
              <Path d="M0 22C0 20.8954 0.895431 20 2 20H20C21.1046 20 22 20.8954 22 22C22 23.1046 21.1046 24 20 24H2C0.895431 24 0 23.1046 0 22Z" fill="white"/>
            </Svg>
          </TouchableOpacity>

          <Text style={styles.logo}>caartI</Text>

          <TouchableOpacity 
            onPress={handleNotificationPress}
            activeOpacity={0.7}
            style={styles.headerButton}
          >
            <Svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <Path d="M12 0C10.9 0 10 0.9 10 2C10 2.6 10.3 3.1 10.7 3.4C7.1 4.4 4.5 7.6 4.5 11.5V17L2 19.5V21H22V19.5L19.5 17V11.5C19.5 7.6 16.9 4.4 13.3 3.4C13.7 3.1 14 2.6 14 2C14 0.9 13.1 0 12 0ZM12 28C13.7 28 15 26.7 15 25H9C9 26.7 10.3 28 12 28Z" fill="white"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.7}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2"/>
                <Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
            <TextInput
              placeholder="Search for Honda Pilot 7-Passenger"
              placeholderTextColor="#8c9199"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchPress}
            />
            <TouchableOpacity onPress={handleFilterPress} activeOpacity={0.7}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M3 7H21" stroke="#8c9199" strokeWidth="2" strokeLinecap="round"/>
                <Path d="M6 12H18" stroke="#8c9199" strokeWidth="2" strokeLinecap="round"/>
                <Path d="M9 17H15" stroke="#8c9199" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { id: 'live', label: 'Live' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'negotiations', label: 'Negotiations' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <LinearGradient
        colors={['rgba(202,219,42,0)', 'rgba(202,219,42,0.69)']}
        style={styles.bottomGradient}
      >
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleNavPress('home')}
            activeOpacity={0.7}
          >
            <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <Path 
                d="M17 3L3 14V31H13V21H21V31H31V14L17 3Z" 
                fill={activeNavItem === 'home' ? '#cadb2a' : '#ffffff'}
                stroke={activeNavItem === 'home' ? '#cadb2a' : '#ffffff'}
                strokeWidth="1"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleNavPress('favorites')}
            activeOpacity={0.7}
          >
            <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <Path 
                d="M17 28.5L14.7 26.4C7.4 19.72 3 15.78 3 10.95C3 7.01 6.01 4 9.95 4C12.13 4 14.22 5.02 15.65 6.64H18.35C19.78 5.02 21.87 4 24.05 4C27.99 4 31 7.01 31 10.95C31 15.78 26.6 19.72 19.3 26.4L17 28.5Z" 
                fill={activeNavItem === 'favorites' ? '#cadb2a' : 'none'}
                stroke={activeNavItem === 'favorites' ? '#cadb2a' : '#ffffff'}
                strokeWidth="2"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleNavPress('menu')}
            activeOpacity={0.7}
          >
            <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <Circle 
                cx="10" 
                cy="10" 
                r="3" 
                fill={activeNavItem === 'menu' ? '#cadb2a' : '#ffffff'}
              />
              <Circle 
                cx="24" 
                cy="10" 
                r="3" 
                fill={activeNavItem === 'menu' ? '#cadb2a' : '#ffffff'}
              />
              <Circle 
                cx="10" 
                cy="24" 
                r="3" 
                fill={activeNavItem === 'menu' ? '#cadb2a' : '#ffffff'}
              />
              <Circle 
                cx="24" 
                cy="24" 
                r="3" 
                fill={activeNavItem === 'menu' ? '#cadb2a' : '#ffffff'}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25.5,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  logo: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: '#cadb2a',
    letterSpacing: -0.41,
  },
  searchContainer: {
    paddingHorizontal: 26,
    marginBottom: 24,
  },
  searchBar: {
    height: 79,
    backgroundColor: '#edeeef',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 31,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#000000',
    marginHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 29,
    marginBottom: 24,
  },
  tabButton: {
    height: 37,
    borderRadius: 5,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#cadb2a',
  },
  tabButtonInactive: {
    backgroundColor: '#121212',
  },
  tabText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#010101',
  },
  tabTextInactive: {
    color: '#ffffff',
  },
  contentContainer: {
    paddingHorizontal: 26,
    gap: 24,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  bottomNav: {
    marginHorizontal: 36,
    height: 55,
    backgroundColor: 'rgba(0,0,0,0.79)',
    borderRadius: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 53,
    marginBottom: 10,
  },
  navItem: {
    width: 34,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
