import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import LandingPage from './pages/Landingpage';
import HomePage from './pages/HomePage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import TagsPage from './pages/TagsPage';
import TagDetailPage from './pages/TagDetailPage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AppProvider>
        <Router>
          <Routes>
            {/* Landing page - no layout needed */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Routes with layout */}
            <Route path="/app" element={
              <Layout>
                <GuestRoute>
                  <HomePage />
                </GuestRoute>
              </Layout>
            } />
            
            <Route path="/question/:id" element={
              <Layout>
                <GuestRoute>
                  <QuestionDetailPage />
                </GuestRoute>
              </Layout>
            } />
            
            <Route path="/tags" element={
              <Layout>
                <GuestRoute>
                  <TagsPage />
                </GuestRoute>
              </Layout>
            } />
            
            <Route path="/tags/:tagName" element={
              <Layout>
                <GuestRoute>
                  <TagDetailPage />
                </GuestRoute>
              </Layout>
            } />

            {/* Protected routes - require authentication */}
            <Route path="/ask" element={
              <Layout>
                <ProtectedRoute>
                  <AskQuestionPage />
                </ProtectedRoute>
              </Layout>
            } />
            
            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Layout>
            } />
            
            <Route path="/saved" element={
              <Layout>
                <ProtectedRoute>
                  <SavedPage />
                </ProtectedRoute>
              </Layout>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </ClerkProvider>
  );
}

export default App;
