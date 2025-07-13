import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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

export default function MobileSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { questions, tags } = useApp();
  const [communityStats, setCommunityStats] = React.useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalUsers: 0,
    totalTags: 0
  });

  // Calculate community stats from available data
  React.useEffect(() => {
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
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link to="/app" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
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
                              onClick={() => setSidebarOpen(false)}
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
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}