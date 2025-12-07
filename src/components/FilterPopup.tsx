import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';

const { width, height } = Dimensions.get('window');

interface FilterPopupProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters?: any;
}

// --- Searchable Dropdown Component ---
const SearchableDropdown = ({
  label,
  value,
  name,
  data,
  onSelect,
  renderItemLabel,
  activeDropdown,
  toggleDropdown
}: any) => {

  const [searchText, setSearchText] = useState('');
  const isOpen = activeDropdown === name;

  useEffect(() => {
    if (!isOpen) setSearchText('');
  }, [isOpen]);

  const filteredData = data.filter((item: any) => {
    if (!searchText) return true;
    const itemLabel = renderItemLabel(item).toString().toLowerCase();
    return itemLabel.includes(searchText.toLowerCase());
  });

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonActive]}
        onPress={() => toggleDropdown(name)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownText, !value && { color: '#999' }]}>
          {value || label}
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={isOpen ? "#cadb2a" : "#000"}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          <View style={styles.dropdownSearchContainer}>
            <Feather name="search" size={18} color="#666" />
            <TextInput
              style={styles.dropdownSearchInput}
              placeholder="Search..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <ScrollView
            nestedScrollEnabled={true}
            style={{ maxHeight: 220 }}
            keyboardShouldPersistTaps="handled"
          >
            {filteredData.length > 0 ? (
              filteredData.map((item: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    toggleDropdown(null);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {renderItemLabel(item)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 15 }}>
                <Text style={{ color: '#999', textAlign: 'center' }}>
                  No results found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export const FilterPopup: React.FC<FilterPopupProps> = ({ visible, onClose, onApply, currentFilters }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Used'>('All');

  const [makes, setMakes] = useState<Models.Brand[]>([]);
  const [models, setModels] = useState<Models.VehicleModel[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Selection State
  const [selectedMake, setSelectedMake] = useState<Models.Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Models.VehicleModel | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // 1. Sync State when Popup Opens
  useEffect(() => {
    if (visible) {
      // Reset or Sync logic
      if (!currentFilters || Object.keys(currentFilters).length === 0) {
        setSelectedMake(null);
        setSelectedModel(null);
        setSelectedYear(null);
        setMinPrice('');
        setMaxPrice('');
        setActiveTab('All');
        setModels([]);
      } else {
        // Pre-fill if filters exist (simplified for numbers/strings)
        if (currentFilters.year) setSelectedYear(currentFilters.year);
        if (currentFilters.min_price) setMinPrice(String(currentFilters.min_price));
        if (currentFilters.max_price) setMaxPrice(String(currentFilters.max_price));
        if (currentFilters.condition) {
          const cond = currentFilters.condition;
          setActiveTab(cond.charAt(0).toUpperCase() + cond.slice(1) as any);
        }
      }

      const loadData = async () => {
        setLoadingData(true);
        try {
          const [makesRes, yearsRes] = await Promise.all([
            apiService.getMakes(),
            apiService.getYears()
          ]);
          if (makesRes.success) setMakes(makesRes.data.data);
          if (yearsRes.success) setYears(yearsRes.data.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    }
  }, [visible]);

  // Load Models when Make changes
  useEffect(() => {
    if (selectedMake) {
      const fetchModels = async () => {
        const res = await apiService.getModels(selectedMake.id);
        if (res.success) setModels(res.data.data);
      };
      fetchModels();
      if (selectedModel && currentFilters?.make !== selectedMake.name) {
        setSelectedModel(null);
      }
    } else {
      setModels([]);
    }
  }, [selectedMake]);

  const handleApply = () => {
    onApply({
      condition: activeTab === 'All' ? null : activeTab.toLowerCase(),
      make: selectedMake?.name,
      make_id: selectedMake?.id,
      model: selectedModel?.name,
      vehicle_model_id: selectedModel?.id,
      year: selectedYear,
      min_price: minPrice ? parseInt(minPrice) : undefined,
      max_price: maxPrice ? parseInt(maxPrice) : undefined,
    });
    onClose();
  };

  const toggleDropdown = (name: string | null) => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  // 🔍 Validation: Check if at least one filter is active
  const isFilterActive =
    activeTab !== 'All' ||
    selectedMake !== null ||
    selectedModel !== null ||
    selectedYear !== null ||
    (minPrice !== '' && minPrice !== '0') ||
    (maxPrice !== '' && maxPrice !== '0');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.popupHeader}>
            <Text style={styles.popupTitle}>Filter Options</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <View style={styles.tabsContainer}>
              {['All', 'New', 'Used'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab as any)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingData && (
              <ActivityIndicator color="#cadb2a" style={{ marginBottom: 10 }} />
            )}

            <View style={styles.formContainer}>
              <SearchableDropdown
                label="Select Make"
                name="make"
                value={selectedMake?.name}
                data={makes}
                renderItemLabel={(item: any) => item.name}
                onSelect={setSelectedMake}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
              />

              <SearchableDropdown
                label="Select Model"
                name="model"
                value={selectedModel?.name}
                data={selectedMake ? models : []}
                renderItemLabel={(item: any) => item.name}
                onSelect={setSelectedModel}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
              />

              <SearchableDropdown
                label="Select Year"
                name="year"
                value={selectedYear?.toString()}
                data={years}
                renderItemLabel={(item: any) => item.toString()}
                onSelect={setSelectedYear}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
              />
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>Price Range (AED)</Text>

              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Any"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.searchButton, !isFilterActive && styles.searchButtonDisabled]}
              onPress={handleApply}
              disabled={!isFilterActive}
            >
              <Text style={[styles.searchButtonText, !isFilterActive && styles.searchButtonTextDisabled]}>
                Apply Filters
              </Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { width: width * 0.9, height: height * 0.85, backgroundColor: '#111', borderRadius: 30, paddingVertical: 20, borderWidth: 1, borderColor: '#cadb2a', overflow: 'hidden' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  popupTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins' },
  scrollContent: { paddingHorizontal: 20 },
  tabsContainer: { flexDirection: 'row', marginBottom: 20, justifyContent: 'center', backgroundColor: '#222', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#cadb2a' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins' },
  activeTabText: { color: '#000' },
  formContainer: { marginBottom: 20 },
  dropdownContainer: { marginBottom: 15 },
  dropdownButton: { backgroundColor: '#fff', borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  dropdownButtonActive: { borderWidth: 2, borderColor: '#cadb2a' },
  dropdownText: { fontSize: 14, fontFamily: 'Poppins', color: '#000' },
  dropdownContent: { backgroundColor: '#fff', marginTop: 5, borderRadius: 12, overflow: 'hidden', paddingBottom: 5 },
  dropdownSearchContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f9f9f9' },
  dropdownSearchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000', height: 36, fontFamily: 'Poppins' },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 14, fontFamily: 'Poppins', color: '#333' },
  priceSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 14, marginBottom: 10, fontFamily: 'Poppins', fontWeight: '600' },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceInputContainer: { flex: 1, backgroundColor: '#222', borderRadius: 12, padding: 10 },
  priceLabel: { color: '#888', fontSize: 10, marginBottom: 2, fontFamily: 'Poppins' },
  priceInput: { color: '#fff', fontSize: 16, fontFamily: 'Poppins', padding: 0 },
  priceDivider: { width: 10 },

  searchButton: { backgroundColor: '#cadb2a', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  searchButtonDisabled: { backgroundColor: '#333' },
  searchButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
  searchButtonTextDisabled: { color: '#666' },
});