import React from 'react';
import { useApp } from '../context/AppContext';
import QuestionCard from '../components/QuestionCard';

export default function SavedPage() {
  const { questions, savedQuestions } = useApp();
  
  const savedQuestionObjects = questions.filter(q => savedQuestions.includes(q.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Saved Questions</h1>
        <p className="mt-2 text-sm text-gray-600">
          {savedQuestionObjects.length} saved question{savedQuestionObjects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {savedQuestionObjects.length > 0 ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          {savedQuestionObjects.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No saved questions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Questions you save will appear here for easy access later.
          </p>
        </div>
      )}
    </div>
  );
}