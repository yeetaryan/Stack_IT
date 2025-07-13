import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BookmarkIcon,
  ShareIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  const { 
    getQuestionDetails,
    incrementViews, 
    voteQuestion, 
    voteAnswer, 
    addAnswer,
    currentUser,
    savedQuestions,
    toggleSaveQuestion
  } = useApp();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerBody, setAnswerBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const viewsIncrementedRef = useRef(null);

  // Effect to load question data
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const questionData = await getQuestionDetails(id);
        setQuestion(questionData);
        
        // Increment views only once per question
        if (viewsIncrementedRef.current !== id) {
          await incrementViews(id);
          viewsIncrementedRef.current = id;
        }
      } catch (error) {
        console.error('Error loading question:', error);
        setError('Question not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuestion();
    }
  }, [id, getQuestionDetails, incrementViews]);

  // Handle authentication-required actions
  const handleAuthRequiredAction = (action) => {
    if (!isSignedIn) {
      setAuthAction(action);
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  // Updated voting handlers with auth check
  const handleVoteQuestion = async (voteType) => {
    if (!handleAuthRequiredAction('vote')) return;
    
    try {
      const result = await voteQuestion(id, voteType);
      setQuestion(prev => ({ 
        ...prev, 
        vote_count: result.total_votes 
      }));
    } catch (error) {
      console.error('Error voting on question:', error);
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!handleAuthRequiredAction('vote')) return;
    
    try {
      const result = await voteAnswer(id, answerId, voteType);
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(a => 
          a.id === answerId ? { ...a, vote_count: result.total_votes } : a
        )
      }));
    } catch (error) {
      console.error('Error voting on answer:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!handleAuthRequiredAction('answer')) return;
    if (!answerBody.trim()) return;

    setIsSubmitting(true);
    try {
      const newAnswer = await addAnswer(id, answerBody);
      setAnswerBody('');
      const updatedQuestion = await getQuestionDetails(id);
      setQuestion(updatedQuestion);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQuestion = () => {
    if (!handleAuthRequiredAction('save')) return;
    toggleSaveQuestion(question.id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading question...</p>
      </div>
    );
  }

  // Error state
  if (error || !question) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Question not found</h3>
        <p className="mt-1 text-sm text-gray-500">The question you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/app')}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to questions
        </button>
      </div>
    );
  }

  const isSaved = savedQuestions.includes(question.id);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Sign in Required</h3>
            <p className="text-gray-600 mb-6">
              You need to sign in to {authAction} on questions.
            </p>
            <div className="flex gap-4">
              <SignInButton mode="modal">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
            <button 
              onClick={() => setShowAuthPrompt(false)}
              className="w-full mt-3 px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 mb-6">
        <div className="flex gap-6">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVoteQuestion(1)}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black ${!isSignedIn ? 'opacity-50' : ''}`}
              title={!isSignedIn ? 'Sign in to vote' : 'Upvote'}
            >
              <ArrowUpIcon className="h-6 w-6" />
            </button>
            <span className="text-xl font-semibold text-gray-900">{question.vote_count || 0}</span>
            <button
              onClick={() => handleVoteQuestion(-1)}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black ${!isSignedIn ? 'opacity-50' : ''}`}
              title={!isSignedIn ? 'Sign in to vote' : 'Downvote'}
            >
              <ArrowDownIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleSaveQuestion}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black mt-2 ${!isSignedIn ? 'opacity-50' : ''}`}
              title={!isSignedIn ? 'Sign in to save' : 'Save question'}
            >
              {isSaved ? (
                <BookmarkSolidIcon className="h-6 w-6 text-black" />
              ) : (
                <BookmarkIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
            <div className="prose max-w-none text-gray-700 mb-6">
              <p className="whitespace-pre-wrap">{question.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags && question.tags.map((tag) => (
                <span
                  key={tag.name || tag}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {tag.name || tag}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{question.views || 0} views</span>
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <ShareIcon className="h-4 w-4" />
                  Share
                </button>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={question.author?.avatar_url || 'https://via.placeholder.com/32'}
                  alt={question.author?.display_name || 'Author'}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="font-medium">{question.author?.display_name || 'Anonymous'}</p>
                  <p className="text-xs">asked {new Date(question.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {question.answers?.length || 0} Answer{(question.answers?.length || 0) !== 1 ? 's' : ''}
        </h2>
        
        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-6">
            {question.answers.map((answer) => (
              <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex gap-6">
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleVoteAnswer(answer.id, 1)}
                      className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black ${!isSignedIn ? 'opacity-50' : ''}`}
                      title={!isSignedIn ? 'Sign in to vote' : 'Upvote'}
                    >
                      <ArrowUpIcon className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-semibold text-gray-900">{answer.vote_count || 0}</span>
                    <button
                      onClick={() => handleVoteAnswer(answer.id, -1)}
                      className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black ${!isSignedIn ? 'opacity-50' : ''}`}
                      title={!isSignedIn ? 'Sign in to vote' : 'Downvote'}
                    >
                      <ArrowDownIcon className="h-5 w-5" />
                    </button>
                    {answer.is_accepted && (
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="prose max-w-none text-gray-700 mb-4">
                      <p className="whitespace-pre-wrap">{answer.content}</p>
                    </div>
                    <div className="flex items-center justify-end text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={answer.author?.avatar_url || 'https://via.placeholder.com/32'}
                          alt={answer.author?.display_name || 'Author'}
                          className="h-6 w-6 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{answer.author?.display_name || 'Anonymous'}</p>
                          <p className="text-xs">answered {new Date(answer.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No answers yet. Be the first to answer!</p>
        )}
      </div>

      {/* Answer Form */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
        
        {isSignedIn ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !answerBody.trim()}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You need to sign in to post an answer.</p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}