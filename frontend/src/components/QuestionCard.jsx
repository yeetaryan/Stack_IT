import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useApp } from '../context/AppContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function QuestionCard({ question }) {
  const { savedQuestions, toggleSaveQuestion } = useApp();
  const isSaved = savedQuestions.includes(question.id);

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-4">
        {/* Vote and Stats Column */}
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500 min-w-[80px]">
          <div className="flex flex-col items-center">
            <span className="font-medium text-gray-900">{question.vote_count || 0}</span>
            <span className="text-xs">votes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={classNames(
              question.is_solved ? 'text-green-600 font-medium' : 'text-gray-900',
              'font-medium'
            )}>
              {question.answer_count || 0}
            </span>
            <span className="text-xs">answers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium text-gray-900">{question.views || 0}</span>
            <span className="text-xs">views</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 hover:text-black">
                <Link to={`/question/${question.id}`} className="hover:underline">
                  {question.title}
                  {question.is_solved && (
                    <CheckCircleIcon className="inline-block ml-2 h-5 w-5 text-green-500" />
                  )}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {question.content ? question.content.substring(0, 150) + '...' : ''}
              </p>
            </div>
            <button
              onClick={() => toggleSaveQuestion(question.id)}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600"
            >
              {isSaved ? (
                <BookmarkSolidIcon className="h-5 w-5 text-black" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Tags and Meta */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {question.tags && question.tags.map((tag) => (
                <Link
                  key={tag.name || tag}
                  to={`/tags/${tag.name || tag}`}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  {tag.name || tag}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <img
                  className="h-4 w-4 rounded-full"
                  src={question.author.avatar_url || question.author.avatar || 'https://via.placeholder.com/32'}
                  alt=""
                />
                <span className="font-medium text-gray-700">{question.author.display_name || question.author.name}</span>
                <span>{question.author.reputation} rep</span>
              </div>
              <time dateTime={question.created_at}>
                {new Date(question.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}