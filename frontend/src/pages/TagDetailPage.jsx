import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QuestionCard from '../components/QuestionCard';

export default function TagDetailPage() {
  const { tagName } = useParams();
  const { getQuestionsByTag } = useApp();
  const questions = getQuestionsByTag(tagName);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-lg font-medium text-gray-700">
            {tagName}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Questions tagged [{tagName}]
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {questions.length > 0 ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No questions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No questions have been tagged with "{tagName}" yet.
          </p>
        </div>
      )}
    </div>
  );
}