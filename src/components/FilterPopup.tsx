import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import RNPickerSelect from 'react-native-picker-select';

type FilterPopupProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    make: string;
    model: string;
    year: string;
    priceRange: [number, number];
    condition: 'all' | 'new' | 'used';
  }) => void;
};

export const FilterPopup = ({
  visible,
  onClose,
  onApply,
}: FilterPopupProps) => {
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3_000_000]);
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all');

  const handleApply = () => {
    onApply({ make, model, year, priceRange, condition });
    onClose();
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setYear('');
    setPriceRange([0, 3_000_000]);
    setCondition('all');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Condition Tabs – now with active underline */}
          <View style={styles.conditionTabs}>
            {(['all', 'new', 'used'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  condition === tab && styles.tabActive,   // <-- active underline
                ]}
                onPress={() => setCondition(tab)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    condition === tab && styles.tabLabelActive, // <-- bold label
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dropdowns */}
          <View style={styles.row}>
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                placeholder={{ label: 'Make', value: '' }}
                onValueChange={setMake}
                value={make}
                items={[
                  { label: 'Toyota', value: 'toyota' },
                  { label: 'Honda', value: 'honda' },
                  { label: 'Ford', value: 'ford' },
                ]}
                style={pickerSelectStyles}
              />
            </View>

            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                placeholder={{ label: 'Model', value: '' }}
                onValueChange={setModel}
                value={model}
                items={[
                  { label: 'Camry', value: 'camry' },
                  { label: 'Civic', value: 'civic' },
                ]}
                style={pickerSelectStyles}
              />
            </View>
          </View>

          {/* Year */}
          <View style={styles.inputWrapper}>
            <RNPickerSelect
              placeholder={{ label: 'Year', value: '' }}
              onValueChange={setYear}
              value={year}
              items={Array.from({ length: 30 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return { label: `${y}`, value: `${y}` };
              })}
              style={pickerSelectStyles}
            />
          </View>

          {/* Price Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              AED {priceRange[0].toLocaleString()} – AED{' '}
              {priceRange[1].toLocaleString()}
            </Text>
           <Slider
  minimumValue={0}
  maximumValue={3_000_000}
  step={10_000}
  value={priceRange}
  onValueChange={(value: number[]) => {
    // Assert it's a tuple of exactly 2 numbers
    setPriceRange([value[0], value[1]] as [number, number]);
  }}
  minimumTrackTintColor="#ffffffff"
  maximumTrackTintColor="#444"
  thumbTintColor="#cadb2a"
/>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {/* <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '88%',
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    /*** NEW: border around the popup ***/
    borderWidth: 2,
    borderColor: '#cadb2a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 20, color: '#fff' },
  close: { fontSize: 28, color: '#cadb2a' },

  /* Condition tabs */
  conditionTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  /*** NEW: active underline ***/
  tabActive: { borderBottomWidth: 2, borderColor: '#cadb2a' },
  tabLabel: { fontFamily: 'Poppins', fontSize: 15, color: '#cadb2a' },
  /*** NEW: active label style ***/
  tabLabelActive: { color: '#cadb2a', fontWeight: '600' },

  /* Dropdown row */
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pickerWrapper: { flex: 0.48 },

  inputWrapper: { marginBottom: 20 },

  /* Slider */
  sliderContainer: { marginBottom: 24 },
  sliderLabel: { color: '#cadb2a', fontFamily: 'Poppins', marginBottom: 8, textAlign: 'center' },

  /* Buttons */
buttonRow: {
    marginTop: 20,
    alignItems: 'center',          // <-- centre children horizontally
  },  resetBtn: {
    // flex: 0.45,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetText: { color: '#fff', fontFamily: 'Poppins', fontWeight: '500' },
 applyBtn: {
    /* keep the same look, just make it a little wider */
    minWidth: 180,
    backgroundColor: '#cadb2a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
applyText: {
    color: '#000',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
  },});

/* PickerSelect custom styles */
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#1e1e1e',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#1e1e1e',
  },
  placeholder: { color: '#888' },
});