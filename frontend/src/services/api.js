import React from 'react';
import { useAuth } from '@clerk/clerk-react';

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// API service class for backend communication
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.getToken = null; // Will be set by the hook
  }

  // Set the token getter function
  setTokenGetter(getTokenFn) {
    this.getToken = getTokenFn;
  }

  // Generic request method with error handling and authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token if available
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token is available
    if (this.getToken) {
      try {
        // Get the session token from Clerk
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('🔑 Auth token added to request:', endpoint);
        } else {
          console.warn('⚠️ No auth token available for request:', endpoint);
        }
      } catch (error) {
        console.warn('❌ Failed to get auth token:', error);
      }
    } else {
      console.warn('⚠️ No token getter available for request:', endpoint);
    }

    const config = {
      headers,
      ...options,
    };

    try {
      console.log(`🚀 Making ${options.method || 'GET'} request to:`, url);
      console.log('📋 Request data:', options.body);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} error for ${endpoint}`);
        
        // Try to get detailed error information
        let errorData;
        try {
          errorData = await response.json();
          console.error('📋 Error details:', errorData);
        } catch (e) {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
        
        // Create a more detailed error message
        let errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
        
        // If it's a validation error (422), show validation details
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`✅ Successful response from ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`💥 API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // === HEALTH CHECK ===
  async healthCheck() {
    return this.get('/health');
  }

  // === USERS ===
  async getUsers() {
    return this.get('/users/');
  }

  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  // Get current user's profile
  async getCurrentUser() {
    return this.get('/users/me');
  }

  // === QUESTIONS ===
  async getQuestions() {
    return this.get('/questions/');
  }

  async getQuestion(questionId) {
    return this.get(`/questions/${questionId}`);
  }

  async createQuestion(questionData) {
    return this.post('/questions', questionData);
  }

  async updateQuestion(questionId, questionData) {
    return this.put(`/questions/${questionId}`, questionData);
  }

  async deleteQuestion(questionId) {
    return this.delete(`/questions/${questionId}`);
  }

  async incrementQuestionViews(questionId) {
    // The backend automatically increments views when getting a question
    return { success: true };
  }

  // Get user-specific questions
  async getUserQuestions(userId) {
    return this.get(`/questions/user/${userId}`);
  }

  // Get current user's questions
  async getMyQuestions() {
    return this.get('/questions/me/questions');
  }

  // === ANSWERS ===
  async getAnswers(questionId) {
    return this.get(`/answers/question/${questionId}`);
  }

  async createAnswer(questionId, answerData) {
    return this.post('/answers', {
      question_id: questionId,
      content: answerData.body || answerData.content
    });
  }

  async updateAnswer(answerId, answerData) {
    return this.put(`/answers/${answerId}`, answerData);
  }

  async deleteAnswer(answerId) {
    return this.delete(`/answers/${answerId}`);
  }

  async acceptAnswer(answerId) {
    return this.post(`/answers/${answerId}/accept`);
  }

  // Get user-specific answers
  async getUserAnswers(userId) {
    return this.get(`/answers/user/${userId}`);
  }

  // Get current user's answers
  async getMyAnswers() {
    return this.get('/answers/me/answers');
  }

  // === VOTES ===
  async voteQuestion(questionId, voteType) {
    return this.post('/votes', {
      question_id: questionId,
      vote_type: voteType
    });
  }

  async voteAnswer(answerId, voteType) {
    return this.post('/votes', {
      answer_id: answerId,
      vote_type: voteType
    });
  }

  async getUserVotes(userId) {
    return this.get(`/users/${userId}/votes`);
  }

  // === TAGS ===
  async getTags() {
    return this.get('/tags/');
  }

  async getTag(tagName) {
    return this.get(`/tags/${tagName}`);
  }

  async createTag(tagData) {
    return this.post('/tags', tagData);
  }

  async getQuestionsByTag(tagName) {
    return this.get(`/tags/${tagName}/questions`);
  }

  // === SEARCH ===
  async searchQuestions(query) {
    return this.get(`/search/questions?q=${encodeURIComponent(query)}`);
  }

  async searchUsers(query) {
    return this.get(`/search/users?q=${encodeURIComponent(query)}`);
  }

  async searchTags(query) {
    return this.get(`/search/tags?q=${encodeURIComponent(query)}`);
  }

  async searchAll(query) {
    return this.get(`/search/all?q=${encodeURIComponent(query)}`);
  }

  // === STATS ===
  async getStats() {
    return this.get('/stats/');
  }

  async getUserStats(userId) {
    return this.get(`/stats/users/${userId}`);
  }

  async getTagStats() {
    return this.get('/stats/tags');
  }

  async getRecentActivity() {
    return this.get('/stats/activity');
  }

  async getTopUsers() {
    return this.get('/stats/users/top');
  }

  async getTopQuestions() {
    return this.get('/stats/questions/top');
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Hook to initialize API service with auth
export const useApiService = () => {
  const { getToken, isSignedIn } = useAuth();
  
  // Set the token getter on the API service
  React.useEffect(() => {
    if (isSignedIn && getToken) {
      console.log('🔧 Setting up API service with auth token');
      apiService.setTokenGetter(getToken);
    } else {
      console.log('⚠️ No auth available, API service running without token');
      apiService.setTokenGetter(null);
    }
  }, [getToken, isSignedIn]);

  return apiService;
};

// Export the singleton for backward compatibility
export default apiService; 