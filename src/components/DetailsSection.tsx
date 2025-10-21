import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const DetailsSection: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  const detailItems = [
    {label: 'Fuel Type', value: 'Gasoline'},
    {label: 'City Mpg', value: '23'},
    {label: 'Drivetrain', value: 'AWD'},
    {label: 'Engine', value: '2.0L 14 16v GDI'},
    {label: 'Exterior Color', value: 'Jet Black'},
    {label: 'Interior Color', value: 'Black'},
    {label: 'Transmission', value: '8-Speed Automatic'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.detailsCard}>
        {detailItems.map((item, index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowMore(!showMore)}>
          <Text style={styles.showMoreText}>Show More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  detailsCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 17,
    paddingHorizontal: 27,
    paddingVertical: 26,
    minHeight: 456,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 17,
  },
  label: {
    color: 'rgba(217, 217, 217, 0.94)',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    flex: 1,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    textAlign: 'right',
    flex: 1,
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  showMoreText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 28.15,
  },
});

export default DetailsSection;
