# Caartl: AI Copilot Instructions

## Project Context
Caartl is a React Native + Expo car auction and negotiation marketplace. The app uses React Context for state management, centralized API service with token-based auth, and drawer-based navigation. Dark theme design system throughout.

**Stack**: React Native 0.79.4, Expo 53, React Navigation 7, TypeScript, AsyncStorage, LinearGradient

---

## Architecture Overview

### Provider Hierarchy (App.tsx)
```
GestureHandlerRootView → SafeAreaProvider → ThemeProvider 
  → AuthProvider → AlertProvider → AppNavigator
```

### Three Core Contexts
   - 401 response automatically clears token and userData
2. **AlertContext** (`src/context/AlertContext.tsx`): `useAlert()` → `showAlert(title, message)`
   - Single global alert modal; use for errors and user feedback

### API Service Layer
**File**: `src/services/ApiService.tsx`
- Single `apiService` instance (default export) wraps all HTTP calls
- Returns `{ success: boolean, status: number, data: T }` for all requests
- Auto-injects Bearer token from AsyncStorage to Authorization header
- Usage: `const result = await apiService.apiCall<Type>('/endpoint', { method: 'POST', body: ... })`

### Navigation Structure
**Files**: `src/navigation/AppNavigator.tsx`, `DrawerNavigator.tsx`
- Stack: Auth flow (Login/Register) → DrawerRoot → DrawerNavigator (nested screens)
- Drawer wraps: Home, Favorites, Profile, MyBiddings, MyBookings, etc.
- Key routes example: `LiveAuction: { carId, viewType: 'live' | 'negotiation' | 'upcoming' }`

const fetchData = async () => {
  try {
    if (result.success && result.data?.data?.data) {
      setData(result.data.data.data);
      setData([]);
    }
    showAlert('Error', 'Failed to fetch.');
  } finally {
    setRefreshing(false);
  }
    fetchData();
);

- FlatList padding: `paddingTop: 100` (TopBar height) + `paddingBottom: 100` (BottomNav height)
---

- **Dark Background**: `#000` — main background
- **Text Primary**: `#fff`; **Text Secondary**: `#888` or `#aaa`
- **Status**: `#ffaa00` (pending), `#00a8ff` (in-transfer), `#cadb2a` (completed), `#ff4444` (cancelled)

### Reusable Style Patterns
1. **Card**: `{ backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#222' }`
2. **Button**: `{ backgroundColor: '#cadb2a', borderRadius: 12, paddingVertical: 15 }` + black text
3. **Input**: `{ backgroundColor: '#111', borderRadius: 12, color: '#fff', borderColor: '#333' }`
4. **TouchableOpacity**: Always use `activeOpacity={0.9}` for consistent feedback

### Typography
- **Body/UI**: Font family `'Poppins'`
- **Price/Accent**: Font family `'Lato'`
- **Logo**: Font family `'Borg9'` (custom, loaded from assets)

---

## Project-Specific Conventions

### Imports
```tsx
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';  // Type definitions
```

### Data Models Location
**File**: `src/data/modal.ts` — All TypeScript interfaces for API responses
- `Vehicle`: Car listing with images, specs, inspection data
- `Booking`: Booking record with `is_auction` field (boolean | null)
- `User`: Auth user profile
- `ApiResult<T>`: Generic response wrapper

### Comments Convention
Use `// 🟢 LABEL:` prefix for highlighting important changes/fixes (visible throughout codebase)
Example: `// 🟢 FIX: Correctly dispatch open drawer action`

### Error Handling
Always use `useAlert()` from AlertContext for user-facing errors:
```tsx
const { showAlert } = useAlert();
// ...
showAlert('Error', 'Failed to fetch data.');
```

### Token/Auth Management
**Never** manually handle AsyncStorage for auth—let AuthContext manage it:
- Access current token via `useAuth()` hook
- Log out: call `logout()` from AuthContext
- Token auto-persists on login; auto-validates on app startup

### Conditional Navigation Example
```tsx
const handlePress = () => {
  if (item.is_auction === true) {
    navigation.navigate('LiveAuction', { carId: vehicle.id, viewType: 'negotiation' });
  } else {
    navigation.navigate('CarDetailPage', { carId: vehicle.id });
  }
};
```

### Route Parameters & useRoute Hook
```tsx
import { useRoute, RouteProp } from '@react-navigation/native';

type ScreenRouteProp = RouteProp<RootStackParamList, 'ScreenName'>;

const route = useRoute<ScreenRouteProp>();
const { paramName } = route.params;  // Extract params
```

### Multi-Step Forms (see BookCarScreen.tsx)
- Manage `currentStep` state for navigation between form sections
- Validate each step before allowing progression
- Collect services via checkbox arrays: `selectedServices: number[]`
- Pre-fill form with user data from `useAuth()` hook

### FormData for File Uploads
Used in `SellCarInquiryScreen.tsx`, `BookCarScreen.tsx`, `AppointmentInquiryScreen.tsx`:
```tsx
const formData = new FormData();
formData.append('field_name', value);
formData.append('file_field', {
  uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
  name: filename,
  type: 'image/jpeg'
});

const result = await apiService.customEndpoint(formData);
```

### Image Picking Pattern (expo-image-picker)
```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsMultipleSelection: true,
  quality: 0.7,
});

if (!result.canceled) {
  setImages([...images, ...result.assets]);
}
```

### Advanced Animations
**Reanimated + Gesture Handler** (LiveCarAuctionScreen.tsx):
- Use `useSharedValue()` for animated state
- Use `Gesture.Pinch()` for gesture recognition
- Wrap components with `<GestureDetector>` for gesture response
- Use `useAnimatedStyle()` for transforms

**React Native Animated** (SplashScreenDark.tsx):
- Use `Animated.Value` refs for fade/translate sequences
- Chain animations with `Animated.sequence()`

---

## Critical Workflows

### Development Server
```bash
npm start                  # Start Expo dev server (interactive menu)
npm run android            # Run on Android emulator/device
npm run ios                # Run on iOS simulator
npm run web                # Run in web browser (limited support)
```

### Key Dependencies
- **React Navigation**: `@react-navigation/native`, `native-stack`, `drawer`
- **Expo**: Handles build, asset loading, platform-specific features
- **Icons**: `@expo/vector-icons` (Feather, MaterialCommunityIcons)
- **Images/Media**: `expo-image-picker`, `expo-av`
- **Storage**: `@react-native-async-storage/async-storage`
- **UI**: `react-native-paper`, `expo-linear-gradient`, `lucide-react-native`

---

## Important Integration Points

### API Calls Pattern
Always check `result.success` before accessing data:
```tsx
const result = await apiService.apiCall<ResponseType>('/endpoint');
if (result.success && result.data?.data) {
  // Use result.data
} else {
  setData([]);  // Default empty state
}
```

### Safe Area Insets
Use for padding around notches/cutouts:
```tsx
const insets = useSafeAreaInsets();
// Use insets.top, insets.bottom, insets.left, insets.right
```

### Drawer Navigation
Open drawer programmatically:
```tsx
import { DrawerActions } from '@react-navigation/native';
navigation.dispatch(DrawerActions.openDrawer());
```

### Image URL Fallback Chain
```tsx
const getImageUrl = (vehicle: any) => {
  if (vehicle?.cover_image?.path) return vehicle.cover_image.path;
  if (vehicle?.images?.[0]?.path) return vehicle.images[0].path;
  if (vehicle?.brand?.image_source) return vehicle.brand.image_source;
  return 'https://via.placeholder.com/300x200';
};
```

### Utility Functions
**File**: `src/lib/utils.ts`
- `cn()` function combines classNames (clsx + tailwind-merge)
- Used rarely since app is React Native (not Web)

### Data State Patterns
Common state lifecycle in screens:
```tsx
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);  // For pagination
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [errors, setErrors] = useState({});  // Form validation
```

### Query Parameters in API Calls
Some endpoints accept query filters (HomeScreen pagination):
```tsx
const result = await apiService.apiCall(`/vehicles?page=${page}&filters=...`);
```

### Custom Component Props Patterns
Most components accept optional props:
```tsx
interface CarCardProps {
  car: Models.Vehicle;
  onPress: (car: Models.Vehicle) => void;
  variant?: 'negotiation' | 'live' | 'upcoming';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}
```

---

## Best Practices & Gotchas

✓ Always pass `keyExtractor` to FlatList: `keyExtractor={(item) => item.id.toString()}`  
✓ Wrap modals in state: `const [visible, setVisible] = useState(false)`  
✓ Use `useFocusEffect` for screen-specific subscriptions/refetches  
✓ Check API response structure: `result.data?.data?.data` (often triple-nested)  
✓ Loading state: Include `ActivityIndicator` while fetching  
✓ Empty state: Include "no data" view in FlatList `ListEmptyComponent`  
✗ Don't manually touch AsyncStorage for auth—use AuthContext  
✗ Don't assume API response data exists; always check `result.success` first  

---

## Exemplary Files by Feature
- **Screen Template**: `src/screens/MyBookingsScreen.tsx`
- **Data Fetching**: `src/screens/FavoritesScreen.tsx`
- **Navigation Routing**: `src/navigation/AppNavigator.tsx`
- **Context Usage**: `src/context/AuthContext.tsx`, `AlertContext.tsx`
- **API Service**: `src/services/ApiService.tsx`
- **Reusable Component**: `src/components/CarCard.tsx`
- **UI Components**: `src/components/TopBar.tsx`, `BottomNavigation.tsx`
- **Multi-Step Forms**: `src/screens/BookCarScreen.tsx`
- **File Uploads**: `src/screens/SellCarInquiryScreen.tsx`, `AppointmentInquiryScreen.tsx`
- **Complex UI**: `src/screens/LiveCarAuctionScreen.tsx` (animations, gestures, modals)
- **Home/Listing**: `src/screens/Caartl/homescreen.tsx` (pagination, filtering, tabs)
