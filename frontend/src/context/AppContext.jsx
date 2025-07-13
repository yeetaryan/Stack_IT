import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useApiService } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const apiService = useApiService();

  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState({
    questions: false,
    tags: false,
    general: false,
    user: false,
  });
  const [error, setError] = useState(null);

  // Update current user when Clerk user changes
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setCurrentUser({
        id: user.id,
        name: user.fullName || user.firstName || 'User',
        avatar: user.imageUrl || user.profileImageUrl,
        email: user.primaryEmailAddress?.emailAddress,
        reputation: 0, // Will be updated from backend
        joinedDate: user.createdAt,
        isActive: true
      });
    } else if (isLoaded && !isSignedIn) {
      setCurrentUser(null);
    }
  }, [isLoaded, isSignedIn, user]);

  // Load data from API on mount and when user changes
  useEffect(() => {
    if (isLoaded) {
      loadInitialData();
    }
  }, [isLoaded, isSignedIn]);

  // Load saved questions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stackit-saved-questions');
    if (saved) {
      setSavedQuestions(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever savedQuestions changes
  useEffect(() => {
    localStorage.setItem('stackit-saved-questions', JSON.stringify(savedQuestions));
  }, [savedQuestions]);

  // Load initial data from API
  const loadInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, general: true }));
      
      // Load questions and tags in parallel
      const [questionsData, tagsData] = await Promise.all([
        apiService.getQuestions(),
        apiService.getTags()
      ]);
      
      setQuestions(questionsData);
      setTags(tagsData);
      setError(null);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, []);

  const addQuestion = async (questionData) => {
    if (!isSignedIn) {
      throw new Error('You must be signed in to ask questions');
    }

    try {
      setLoading(prev => ({ ...prev, questions: true }));
      
      console.log('📋 Question data being sent:', questionData);
      
      // Transform the data to match backend schema
      const backendData = {
        title: questionData.title,
        content: questionData.body,        // body -> content
        tag_names: questionData.tags       // tags -> tag_names
      };
      
      console.log('📋 Backend data:', backendData);
      
      const newQuestion = await apiService.createQuestion(backendData);
      
      setQuestions(prev => [newQuestion, ...prev]);
      setError(null);
      return newQuestion.id;
    } catch (error) {
      console.error('Failed to create question:', error);
      const errorMessage = error.message || 'Failed to create question. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  const addAnswer = async (questionId, answerBody) => {
    if (!isSignedIn) {
      throw new Error('You must be signed in to answer questions');
    }

    try {
      setLoading(prev => ({ ...prev, questions: true }));
      
      const newAnswer = await apiService.createAnswer(questionId, {
        body: answerBody,
      });

      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, answers: [...(q.answers || []), newAnswer], answer_count: (q.answer_count || 0) + 1 }
          : q
      ));

      // Create notification for question author if someone else answered
      const question = questions.find(q => q.id === questionId);
      if (question && question.author?.id !== currentUser?.id) {
        createNotification(
          'answer',
          `${currentUser?.name} answered your question: "${question.title}"`,
          questionId
        );
      }
      
      setError(null);
      return newAnswer.id;
    } catch (error) {
      console.error('Failed to create answer:', error);
      setError('Failed to create answer. Please try again.');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  const voteQuestion = async (questionId, voteType) => {
    if (!isSignedIn) {
      throw new Error('You must be signed in to vote');
    }

    try {
      const result = await apiService.voteQuestion(questionId, voteType);
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, vote_count: result.total_votes }
          : q
      ));

      // Create notification for question author if someone else voted
      const question = questions.find(q => q.id === questionId);
      if (question && question.author?.id !== currentUser?.id && voteType > 0) {
        createNotification(
          'vote',
          `${currentUser?.name} upvoted your question: "${question.title}"`,
          questionId
        );
      }
      
      setError(null);
      return result;
    } catch (error) {
      console.error('Failed to vote on question:', error);
      setError('Failed to vote. Please try again.');
      throw error;
    }
  };

  const voteAnswer = async (questionId, answerId, voteType) => {
    if (!isSignedIn) {
      throw new Error('You must be signed in to vote');
    }

    try {
      const result = await apiService.voteAnswer(answerId, voteType);
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? {
              ...q,
              answers: (q.answers || []).map(a => 
                a.id === answerId 
                  ? { ...a, vote_count: result.total_votes }
                  : a
              )
            }
          : q
      ));

      // Create notification for answer author if someone else voted
      const question = questions.find(q => q.id === questionId);
      if (question && question.answers) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer && answer.author?.id !== currentUser?.id && voteType > 0) {
          createNotification(
            'vote',
            `${currentUser?.name} upvoted your answer on: "${question.title}"`,
            questionId
          );
        }
      }
      
      setError(null);
      return result;
    } catch (error) {
      console.error('Failed to vote on answer:', error);
      setError('Failed to vote. Please try again.');
      throw error;
    }
  };

  const getQuestionDetails = useCallback(async (questionId) => {
    try {
      const question = await apiService.getQuestion(questionId);
      return question;
    } catch (error) {
      console.error('Failed to get question details:', error);
      throw error;
    }
  }, [apiService]);

  const incrementViews = async (questionId) => {
    try {
      await apiService.incrementQuestionViews(questionId);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const toggleSaveQuestion = (questionId) => {
    if (!isSignedIn) {
      throw new Error('You must be signed in to save questions');
    }

    setSavedQuestions(prev => {
      const isSaved = prev.includes(questionId);
      if (isSaved) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const createNotification = (type, message, questionId) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      questionId,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getQuestionById = (questionId) => {
    return questions.find(q => q.id === questionId);
  };

  const getUserQuestions = async (userId) => {
    try {
      if (userId === currentUser?.id) {
        return await apiService.getMyQuestions();
      } else {
        return await apiService.getUserQuestions(userId);
      }
    } catch (error) {
      console.error('Failed to get user questions:', error);
      return [];
    }
  };

  const getUserAnswers = async (userId) => {
    try {
      if (userId === currentUser?.id) {
        return await apiService.getMyAnswers();
      } else {
        return await apiService.getUserAnswers(userId);
      }
    } catch (error) {
      console.error('Failed to get user answers:', error);
      return [];
    }
  };

  const searchQuestions = async (query) => {
    try {
      return await apiService.searchQuestions(query);
    } catch (error) {
      console.error('Failed to search questions:', error);
      return [];
    }
  };

  const getAllTags = useCallback(async () => {
    try {
      const tagsData = await apiService.getTags();
      return tagsData;
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return [];
    }
  }, [apiService]);

  const value = {
    // State
    questions,
    savedQuestions,
    currentUser,
    notifications,
    tags,
    loading,
    error,
    isSignedIn,
    isLoaded,

    // Actions
    addQuestion,
    addAnswer,
    voteQuestion,
    voteAnswer,
    getQuestionDetails,
    incrementViews,
    toggleSaveQuestion,
    createNotification,
    markNotificationAsRead,
    clearAllNotifications,
    getQuestionById,
    getUserQuestions,
    getUserAnswers,
    searchQuestions,
    refreshData,
    getAllTags,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};