import React from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';

export default function GuestRoute({ children, requireAuth = false, actionType = "interact" }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required and user is not signed in, show sign-in prompt
  if (requireAuth && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to {actionType === "ask" ? "ask questions" : actionType === "answer" ? "answer questions" : "perform this action"}.
          </p>
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
      </div>
    );
  }

  return children;
}