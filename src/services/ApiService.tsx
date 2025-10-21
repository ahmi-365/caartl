import AsyncStorage from '@react-native-async-storage/async-storage';
// Make sure you have @env configured in babel.config.js for this to work
import { API_BASE_URL } from '@env';

// API Configuration

class ApiService {
  baseURL: string;
  constructor() {
    this.baseURL = API_BASE_URL || 'http://localhost:3000/api'; // Fallback for safety
  }

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Generic API call method
  async apiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const finalOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...(defaultOptions.headers as Record<string, string>),
        ...(options.headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      // Handle cases where the response might not have a body (e.g., 204 No Content)
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;
      
      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        status: 0,
        data: {
          success: false,
          message: 'Network error. Please check your internet connection.',
        },
      };
    }
  }

  // Authentication APIs
  async register(userData: any) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User APIs
  async getUserProfile() {
    return this.apiCall('/user/profile', {
      method: 'GET',
    });
  }

  /**
   * [NEW] Updates the user's profile information.
   * @param payload - An object containing the fields to update, e.g., { name, email }.
   */
  async updateUserProfile(payload: { name: string; email: string }) {
    return this.apiCall('/user/profile', {
      method: 'PUT', 
      body: JSON.stringify(payload),
    });
  }

  // Change Password API
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.apiCall('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Health check
  async healthCheck() {
    return this.apiCall('/health', {
      method: 'GET',
    });
  }

  // Store user data after successful authentication
  async storeUserData(userData: any, token: string) {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }

  // Get stored user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error)
    {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Logout - clear stored data
  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Optionally verify token with server
      const response = await this.getUserProfile();
      return response.success;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}


// Export singleton instance
export default new ApiService();