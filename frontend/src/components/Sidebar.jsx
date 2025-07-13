import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  QuestionMarkCircleIcon, 
  TagIcon, 
  UserIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

const navigation = [
  { name: 'Home', href: '/app', icon: HomeIcon },
  { name: 'Ask Question', href: '/ask', icon: QuestionMarkCircleIcon },
  { name: 'Tags', href: '/tags', icon: TagIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Saved', href: '/saved', icon: BookmarkIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const location = useLocation();
  const { questions, tags } = useApp();
  const [communityStats, setCommunityStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalUsers: 0,
    totalTags: 0
  });

  // Calculate community stats from available data
  useEffect(() => {
    const totalQuestions = questions.length;
    const totalAnswers = questions.reduce((sum, q) => sum + (q.answer_count || 0), 0);
    const totalTags = tags.length;
    
    // Get unique users from questions
    const uniqueUsers = new Set();
    questions.forEach(q => {
      if (q.author?.id) uniqueUsers.add(q.author.id);
    });
    const totalUsers = uniqueUsers.size;

    setCommunityStats({
      totalQuestions,
      totalAnswers,
      totalUsers,
      totalTags
    });
  }, [questions, tags]);

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-8 h-8">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">StackIt</h2>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? 'bg-gray-50 text-black'
                          : 'text-gray-700 hover:text-black hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          location.pathname === item.href ? 'text-black' : 'text-gray-400 group-hover:text-black',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            
            {/* Community Stats */}
            <li className="mt-auto">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Community Stats</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Questions</span>
                    <span className="font-medium">{communityStats.totalQuestions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Answers</span>
                    <span className="font-medium">{communityStats.totalAnswers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users</span>
                    <span className="font-medium">{communityStats.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tags</span>
                    <span className="font-medium">{communityStats.totalTags.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}