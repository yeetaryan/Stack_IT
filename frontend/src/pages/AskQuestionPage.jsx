import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  QuestionMarkCircleIcon, 
  DocumentTextIcon, 
  TagIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

export default function AskQuestionPage() {
  const navigate = useNavigate();
  const { currentUser, addQuestion } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.isActive) return;

    setIsSubmitting(true);
    
    try {
      const questionData = {
        title: formData.title,
        body: formData.body,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      console.log('📋 Submitting question:', questionData);

      const questionId = await addQuestion(questionData);
      navigate(`/question/${questionId}`);
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error.message || 'Failed to create question. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!currentUser?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QuestionMarkCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">You need to be logged in to ask a question.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Ask a Question</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Share your knowledge with the community. Be specific and clear to get the best answers.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-0">
            
            {/* Title Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Question Title</h3>
                  <p className="text-sm text-gray-500">Be specific and imagine you're asking a question to another person</p>
                </div>
              </div>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full text-lg px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400"
                placeholder="e.g. How do I center a div with CSS flexbox?"
              />
            </div>

            {/* Body Section */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Description</h3>
                  <p className="text-sm text-gray-500">Include all the information someone would need to answer your question</p>
                </div>
              </div>
              <textarea
                name="body"
                id="body"
                required
                rows={8}
                value={formData.body}
                onChange={handleChange}
                className="w-full text-base px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400 resize-none"
                placeholder="Describe your problem in detail. Include what you've tried, what you expected to happen, and what actually happened. Code examples are helpful!"
              />
            </div>

            {/* Tags Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                  <p className="text-sm text-gray-500">Add up to 5 tags to describe what your question is about</p>
                </div>
              </div>
              <input
                type="text"
                name="tags"
                id="tags"
                required
                value={formData.tags}
                onChange={handleChange}
                className="w-full text-base px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400"
                placeholder="javascript, react, css, html, frontend"
              />
              <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
            </div>

            {/* Submit Section */}
            <div className="p-8 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/app')}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.body || !formData.tags}
                  className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Publishing...
                    </span>
                  ) : (
                    'Publish Question'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">💡 Tips for a great question:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Search to see if your question has been asked before</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Be specific with your title and include relevant keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Include code examples, error messages, or screenshots when relevant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Use proper grammar and formatting to make your question easy to read</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}