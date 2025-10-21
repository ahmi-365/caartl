import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TabNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'Live', title: 'Live', count: '09' },
    { id: 'Upcoming', title: 'Upcoming', count: '04' },
    { id: 'Negotiations', title: 'Negotiations', count: '06' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            {tab.title}
          </Text>
          <View style={[
            styles.badge,
            activeTab === tab.id ? styles.activeBadge : styles.inactiveBadge,
          ]}>
            <Text style={[
              styles.badgeText,
              activeTab === tab.id ? styles.activeBadgeText : styles.inactiveBadgeText,
            ]}>
              {tab.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 29,
    marginBottom: 30,
  },
  tab: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#CADB2A',
    width: 69,
    height: 37,
  },
  inactiveTab: {
    backgroundColor: '#131313',
    minWidth: 69,
    height: 37,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    marginRight: 8,
  },
  activeTabText: {
    color: '#020202',
  },
  inactiveTabText: {
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 19,
    height: 19,
    borderRadius: 9.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: '#CADB2A',
  },
  inactiveBadge: {
    backgroundColor: '#131313',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16.5,
  },
  activeBadgeText: {
    color: '#FFFFFF',
  },
  inactiveBadgeText: {
    color: '#000000',
  },
});

export default TabNavigation;
