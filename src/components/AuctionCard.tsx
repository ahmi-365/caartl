import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CountdownTimer from './CountdownTimer';

const { width } = Dimensions.get('window');

const AuctionCard = ({ auction }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{ uri: auction.image }} style={styles.carImage} />
      
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <CountdownTimer timeLeft={auction.timeLeft} />
        
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>{auction.title}</Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceSection}>
              <View style={styles.priceBar}>
                <LinearGradient
                  colors={['#CADB2A', '#9BC53D']}
                  style={styles.priceBarFill}
                />
              </View>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.priceValue}>{auction.currentBid}</Text>
            </View>
            
            <View style={styles.priceDivider} />
            
            <View style={styles.priceSection}>
              <View style={styles.priceBarEmpty} />
              <Text style={styles.priceLabel}>Seller Expectation</Text>
              <Text style={styles.priceValue}>{auction.sellerExpectation}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{auction.bids} Bids</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{auction.year}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{auction.condition}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{auction.distance}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.favoriteButton}>
        <Image 
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/zfBG7a3EVa.png' }}
          style={styles.starIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: 211,
    borderRadius: 10,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 104,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  carInfo: {
    marginBottom: 15,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 16.8,
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  priceBar: {
    height: 15,
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 100,
    marginBottom: 2,
  },
  priceBarFill: {
    height: '100%',
    width: '100%',
    borderRadius: 100,
  },
  priceBarEmpty: {
    height: 15,
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 100,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 16.8,
    textTransform: 'uppercase',
  },
  priceDivider: {
    width: 1,
    height: 39,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 15,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    width: 28,
    height: 28,
  },
});

export default AuctionCard;
