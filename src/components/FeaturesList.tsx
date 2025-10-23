import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// Lucide icons (no network images)
import {
  Settings,   // Transmission
  Users,      // Door & Seats
  Wind,       // Air Condition
  Fuel,       // Fuel Type
  ArrowRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type Feature = {
  Icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  highlighted?: boolean;
};

type Props = {
  /** Called when the user taps the right arrow */
  onSeeAllPress?: () => void;
};

const FeaturesList: React.FC<Props> = ({ onSeeAllPress }) => {
    const navigation = useNavigation();
  
  const features: Feature[] = [
    {
      Icon: Settings,
      title: 'Transmission',
      subtitle: 'Auto',
    },
    {
      Icon: Users,
      title: 'Door & Seats',
      subtitle: '4 Doors and 7 Seats',
    },
    {
      Icon: Wind,
      title: 'Air Condition',
      subtitle: 'Climate Control',
    },
    {
      Icon: Fuel,
      title: 'Fuel Type',
      subtitle: 'Diesel',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Features</Text>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => navigation.navigate('CarDetailPage')}
          activeOpacity={0.7}
        >xz
          <ArrowRight size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 2 × 2 Grid */}
      <View style={styles.grid}>
        {features.map((f, i) => (
          <View
            key={i}
            style={[styles.card, f.highlighted && styles.cardHighlighted]}
          >
            <f.Icon
              size={32}
              color="#FFD700"
              strokeWidth={2}
              style={styles.icon}
            />
            <Text style={styles.title}>{f.title}</Text>
            <Text style={styles.subtitle}>{f.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },

  /* ---------- Header ---------- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ---------- Grid ---------- */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },

  card: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.74)',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12.5,
    elevation: 5,
    alignItems: 'center',
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: '#00FFFF',
  },

  icon: { marginBottom: 8 },
  title: {
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#979797',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default FeaturesList;