import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  TagIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

export default function StatsPage() {
  const { getStats, getAllTags, questions, loading } = useApp();
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const [statsData, tagsData] = await Promise.all([
          getStats(),
          getAllTags()
        ]);
        setStats(statsData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [getStats, getAllTags]);

  if (isLoading || !stats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Questions',
      value: stats.total_questions || 0,
      icon: QuestionMarkCircleIcon,
      color: 'text-blue-600',
    },
    {
      name: 'Total Answers',
      value: stats.total_answers || 0,
      icon: ChatBubbleLeftIcon,
      color: 'text-green-600',
    },
    {
      name: 'Total Users',
      value: stats.total_users || 0,
      icon: UserGroupIcon,
      color: 'text-purple-600',
    },
    {
      name: 'Total Tags',
      value: stats.total_tags || 0,
      icon: TagIcon,
      color: 'text-orange-600',
    },
  ];

  const topQuestions = [...questions]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of community activity and engagement.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Questions */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Top Voted Questions
          </h2>
          {topQuestions.length > 0 ? (
            <div className="space-y-4">
              {topQuestions.map((question, index) => (
                <div key={question.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {question.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{question.vote_count || 0} votes</span>
                      <span>{question.answer_count || 0} answers</span>
                      <span>{question.views || 0} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No questions yet.</p>
          )}
        </div>

        {/* Popular Tags */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-blue-500" />
            Most Popular Tags
          </h2>
          {tags.length > 0 ? (
            <div className="space-y-3">
              {tags.slice(0, 10).map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">#{index + 1}</span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {tag.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{tag.usage_count || 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tags yet.</p>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Most Used Tag</p>
            <p className="text-lg font-semibold text-gray-900">{tags.length > 0 ? tags[0].name : 'No tags yet'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Most Upvoted Question</p>
            <p className="text-lg font-semibold text-gray-900 truncate">{topQuestions.length > 0 ? topQuestions[0].title : 'No questions yet'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Solved Questions</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.solved_questions || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}