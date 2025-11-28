import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Models from '../data/modal'; // Make sure this path is correct

// API Configuration
class ApiService {
  baseURL: string;

  constructor() {
    // Using the base URL as specified.
    this.baseURL = 'https://api.caartl.com/api';
  }

  // Get stored token from AsyncStorage
  async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Generic method for making API calls.
   * It automatically attaches the Authorization header if a token exists.
   * This is perfect for your requirement, as the token will be null for login/register
   * and present for all other authenticated calls.
   */
  async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<Models.ApiResult<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Conditionally add the Authorization header only if a token exists
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const finalOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers },
    };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error(`API call error to ${endpoint}:`, error);
      return {
        success: false,
        status: 0,
        data: { message: 'Network error or invalid JSON response.' } as any,
      };
    }
  }

  // ===================================
  // AUTHENTICATION APIs (No Token Sent)
  // ===================================

  async register(userData: any): Promise<Models.ApiResult<Models.RegisterResponse>> {
    return this.apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any): Promise<Models.ApiResult<Models.LoginResponse>> {
    return this.apiCall('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // ===================================
  // AUTHENTICATED APIs (Token is Sent)
  // ===================================

  async logout(): Promise<Models.ApiResult<Models.LogoutResponse>> {
    return this.apiCall('/logout', { method: 'POST' });
  }

  // --- AUCTION APIs ---
  async getAuctions(perPage: number = 10): Promise<Models.ApiResult<Models.ApiResponse<Models.PaginatedResponse<Models.Vehicle>>>> {
    return this.apiCall(`/auctions?per_page=${perPage}`);
  }

  async getAuctionDetails(id: number): Promise<Models.ApiResult<Models.AuctionDetailsResponse>> {
    return this.apiCall(`/auctions/show/${id}`);
  }

  // --- BIDDING APIs ---
  async getBiddingInfo(auctionId: number): Promise<Models.ApiResult<Models.BiddingInfoResponse>> {
    return this.apiCall(`/biddings/${auctionId}`);
  }

  async placeBid(auctionId: number, bidData: { current_bid: number; max_bid: number }): Promise<Models.ApiResult<Models.PlaceBidResponse>> {
    return this.apiCall(`/place-bid/${auctionId}`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async getBidHistory(auctionId: number): Promise<Models.ApiResult<Models.ApiResponse<Models.Bid[]>>> {
    return this.apiCall(`/bid-history/${auctionId}`);
  }

  // --- BOOKING API (Special handling for FormData) ---
  async bookNow(bookingData: FormData): Promise<Models.ApiResult<any>> {
    const url = `${this.baseURL}/bookings/book-now`;
    const token = await this.getToken();

    try {
      // For FormData, we don't set 'Content-Type'. Fetch does it automatically.
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // We still need to add the Authorization header manually here.
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: bookingData,
      });
      const data = await response.json();
      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error('API call error to /bookings/book-now:', error);
      return { success: false, status: 0, data: { message: 'Network error.' } };
    }
  }

  // --- PACKAGES API ---
  async getPackages(): Promise<Models.ApiResult<Models.ApiResponse<Models.PaginatedResponse<Models.Package>>>> {
    // Note: The endpoint is /admin/packages as per your documentation
    return this.apiCall('/admin/packages');
  }

  // ===================================
  // USER DATA & SESSION MANAGEMENT
  // ===================================

  async storeUserData(user: Models.User, token: string) {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }

  async getUserData(): Promise<Models.User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
}

// Export a singleton instance so the whole app uses the same object
export default new ApiService();