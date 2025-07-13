import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import QuestionCard from '../components/QuestionCard';

const sortOptions = [
  { name: 'Newest', value: 'newest' },
  { name: 'Active', value: 'active' },
  { name: 'Votes', value: 'votes' },
  { name: 'Unanswered', value: 'unanswered' },
];

export default function HomePage() {
  const { questions, tags, loading, error } = useApp();
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('All');

  // Calculate top 10 tags with most questions
  const topTags = useMemo(() => {
    const tagCounts = {};
    
    // Count questions for each tag
    questions.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          const tagName = tag.name || tag;
          tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [questions]);

  // Filter questions by selected tag
  const filteredQuestions = useMemo(() => {
    if (selectedTag === 'All') return questions;
    
    return questions.filter(question => {
      if (!question.tags || !Array.isArray(question.tags)) return false;
      return question.tags.some(tag => {
        const tagName = tag.name || tag;
        return tagName === selectedTag;
      });
    });
  }, [questions, selectedTag]);

  // Sort filtered questions
  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      switch (selectedSort) {
        case 'votes':
          return (b.vote_count || 0) - (a.vote_count || 0);
        case 'unanswered':
          return (a.answer_count || 0) - (b.answer_count || 0);
        case 'active':
          // Sort by most recent activity (updated_at or created_at)
          const aLastActivity = new Date(a.updated_at || a.created_at).getTime();
          const bLastActivity = new Date(b.updated_at || b.created_at).getTime();
          return bLastActivity - aLastActivity;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [filteredQuestions, selectedSort]);

  const handleTagClick = (tagName) => {
    setSelectedTag(tagName);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">All Questions</h1>
        <p className="mt-2 text-sm text-gray-700">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tag Filter Pills */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {/* All button */}
          <button
            onClick={() => handleTagClick('All')}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedTag === 'All'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {/* Individual tag buttons */}
          {topTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTag === tag.name
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.name} ({tag.count})
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {sortOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => setSelectedSort(option.value)}
              className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                selectedSort === option.value
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {option.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Questions List */}
      <div>
        {loading.general ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-sm">
              <p>{error}</p>
            </div>
          </div>
        ) : sortedQuestions.length > 0 ? (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
            {sortedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : selectedTag !== 'All' ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No questions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No questions are tagged with "{selectedTag}".
            </p>
            <button
              onClick={() => handleTagClick('All')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Show all questions
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No questions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by asking a new question.</p>
          </div>
        )}
      </div>
    </>
  );
}
