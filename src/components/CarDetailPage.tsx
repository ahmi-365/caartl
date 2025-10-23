import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface CarDetailScreenProps {
  onBack?: () => void;
}

export const CarDetailPage: React.FC<CarDetailScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Details');

  const featureCards = [
    { 
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#cadb2a" strokeWidth="2"/>
          <Circle cx="12" cy="12" r="3" fill="#cadb2a"/>
        </Svg>
      ), 
      title: 'Transmission', 
      subtitle: 'Auto' 
    },
    { 
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#cadb2a"/>
        </Svg>
      ), 
      title: 'Door & Seats', 
      subtitle: '4 Doors and 7 Seats' 
    },
    { 
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#cadb2a"/>
          <Path d="M12 6v6l5 3" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      ), 
      title: 'Air Condition', 
      subtitle: 'Climate Control' 
    },
    { 
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" fill="#cadb2a"/>
        </Svg>
      ), 
      title: 'Fuel Type', 
      subtitle: 'Diesel' 
    },
  ];

  const detailsData = [
    { 
      label: 'Fuel Type', 
      value: 'Gasoline',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z" fill="#888"/>
        </Svg>
      )
    },
    { 
      label: 'City Mpg', 
      value: '23',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#888"/>
        </Svg>
      )
    },
    { 
      label: 'Drivetrain', 
      value: 'AWD',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" fill="none" stroke="#888" strokeWidth="2"/>
          <Path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="#888" strokeWidth="2"/>
        </Svg>
      )
    },
    { 
      label: 'Engine', 
      value: '2.0L I4 16v GDI',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#888" strokeWidth="2"/>
        </Svg>
      )
    },
    { 
      label: 'Exterior Color', 
      value: 'Jet Black',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="none" stroke="#888" strokeWidth="2"/>
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#888"/>
        </Svg>
      )
    },
    { 
      label: 'Interior Color', 
      value: 'Black',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#888"/>
        </Svg>
      )
    },
    { 
      label: 'Transmission', 
      value: '8-Speed Automatic',
      icon: (
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#888" strokeWidth="2"/>
          <Circle cx="12" cy="12" r="3" fill="#888"/>
        </Svg>
      )
    },
  ];

  const features = [
    'Alarm System',
    'Premium sound system',
    'Heads up display',
    'Bluetooth system',
    'Climate Control',
    'Keyless Entry',
    'Cruise Control',
    'Park assist system',
  ];

  const tabs = ['Details', 'Features', 'Exterior', 'Comments'];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
  <LinearGradient
    colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']}
    style={styles.container}
  >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M15 18L9 12L15 6" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Detail Page</Text>
        <View style={styles.notificationButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" 
              stroke="#cadb2a" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
          <View style={styles.notificationDot} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            {featureCards.slice(0, 2).map((card, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.iconContainer}>
                  {card.icon}
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cardRow}>
            {featureCards.slice(2, 4).map((card, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.iconContainer}>
                  {card.icon}
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Details Section */}
        {activeTab === 'Details' && (
          <View style={styles.contentContainer}>
            {detailsData.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  {item.icon}
                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>Show More ...</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Features Section */}
        {activeTab === 'Features' && (
          <View style={styles.contentContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.bulletContainer}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
                {index === features.length - 1 && (
                  <TouchableOpacity style={styles.checkButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" stroke="#cadb2a" strokeWidth="2" />
                      <Path d="M9 12l2 2 4-4" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>Show More ...</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exterior Section */}
        {activeTab === 'Exterior' && (
          <View style={styles.exteriorContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80' }}
              style={styles.carImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Comments Section */}
        {activeTab === 'Comments' && (
          <View style={styles.commentsContainer}>
            <TouchableOpacity style={styles.commentsButton}>
              <Text style={styles.commentsButtonText}>Comments & Terms Conditions</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cadb2a',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#cadb2a',
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888888',
  },
  tabsScrollView: {
    marginTop: 8,
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#cadb2a',
  },
  tabText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  contentContainer: {
    marginHorizontal: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#ffffff',
  },
  detailValue: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingTop: 16,
  },
  showMoreText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#888888',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cadb2a',
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#ffffff',
  },
  checkButton: {
    padding: 4,
  },
  exteriorContainer: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    height: 300,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  commentsContainer: {
    marginHorizontal: 16,
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  commentsButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  dropdownArrow: {
    color: '#cadb2a',
    fontSize: 14,
  },
});