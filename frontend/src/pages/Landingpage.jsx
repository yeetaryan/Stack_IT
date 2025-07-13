import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, SignUpButton } from '@clerk/clerk-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-50 overflow-x-hidden font-['Inter','Noto Sans',sans-serif]">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-[#ededed] px-10 py-3">
          <div className="flex items-center gap-4 text-[#141414]">
            <div className="w-4 h-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight">StackIt</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link to="/app" className="text-sm font-medium text-[#141414] hover:text-gray-600 transition-colors">Home</Link>
              <a className="text-sm font-medium text-[#141414]" href="https://github.com/yeetaryan/StackIt" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="text-sm font-medium text-[#141414]" href="#contact">Contact</a>
            </div>
            
            {/* Authentication button */}
            <div className="flex items-center">
              {isSignedIn ? (
                <button 
                  onClick={() => navigate('/app')}
                  className="h-10 px-4 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Go to App
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button className="h-10 px-4 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-col items-center px-4 md:px-20 py-10 w-full">
          <section className="text-center bg-cover bg-center rounded-lg p-6 min-h-[480px] flex flex-col justify-center items-center w-full max-w-5xl"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxsgEF6jZ9eKL8lGhz1ffmR3_yXCyeFV8hUqH6xWI0o1N-ZAs-BRmR9CW9ARGi6UC4n3V6q2JUdTc83M33sE00Ec3Zn2SnmQU753tADeyIew0wgJ5PMuLlKaT-qfnYHlN9U9rJIKyANFlHNd8FqPK0KPYl_Wock0eOAznMNtMvSN6s8PuObpmt1ePrncfMdVnvGEgPHyGHc60AKLMUq3l5tRlxX1f_kkbyeJo7-lwmrz-7PYY8prZtRzGUplgYKvSfzZhZzhzMAq8')` }}>
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">Ask. Answer. Learn. Together.</h1>
            <p className="text-white text-base md:text-lg max-w-2xl mt-2">
              Join our community-driven Q&A platform for collaborative learning and structured knowledge sharing.
            </p>
            {isSignedIn ? (
              <button 
                onClick={() => navigate('/app')}
                className="mt-6 h-12 px-6 bg-black text-white rounded-lg font-bold text-base hover:bg-gray-800 transition-colors"
              >
                Go to App
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="mt-6 h-12 px-6 bg-black text-white rounded-lg font-bold text-base hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            )}
          </section>

          <section className="mt-20 w-full max-w-5xl text-left">
            <h2 className="text-3xl font-bold text-[#141414] mb-4">Features</h2>
            <p className="text-base text-[#141414] mb-8">
              Explore the core features that make StackIt a powerful platform for collaborative learning and knowledge sharing.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard title="Ask Questions" icon="❓" desc="Craft clear, concise questions with detailed descriptions and relevant tags to ensure they reach the right audience." />
              <FeatureCard title="Answer with Clarity" icon="✏️" desc="Utilize our rich editor to format your answers effectively, making them easy to understand and visually appealing." />
              <FeatureCard title="Stay Connected" icon="🔔" desc="Receive real-time notifications for new answers, mentions, and updates, ensuring you never miss important interactions." />
            </div>
          </section>

          <section className="mt-20 w-full max-w-5xl">
            <h2 className="text-2xl font-bold text-[#141414] mb-6">How It Works</h2>
            <div className="flex flex-col gap-4">
              <StepItem number="1" label="Get Started" />
              <StepItem number="2" label="Ask or Search Questions" />
              <StepItem number="3" label="Contribute with Answers" />
              <StepItem number="4" label="Earn Reputation" />
            </div>
          </section>

          <section className="mt-20 w-full max-w-5xl">
            <h2 className="text-2xl font-bold text-[#141414] mb-6">Community Feedback</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <TestimonialCard name="Sophia Carter" role="Software Engineer" quote="StackIt has transformed the way I learn and share knowledge. The community is incredibly supportive and the platform is intuitive to use." />
              <TestimonialCard name="Ethan Walker" role="Data Scientist" quote="I love the structured approach to Q&A on StackIt. It's easy to find exactly what I need, and the quality of answers is consistently high." />
              <TestimonialCard name="Olivia Bennett" role="UX Designer" quote="The real-time notifications keep me engaged and ensure I never miss out on important discussions. StackIt is a game-changer for collaborative learning." />
            </div>
          </section>
        </main>

        <footer id="contact" className="bg-neutral-100 py-10 mt-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/app" className="text-neutral-500 hover:text-neutral-700 transition-colors">Home</Link>
              <a href="https://github.com/yeetaryan/StackIt" className="text-neutral-500 hover:text-neutral-700 transition-colors">GitHub</a>
              <a href="#" className="text-neutral-500 hover:text-neutral-700 transition-colors">Contact</a>
            </div>
            
            {/* Contact Information */}
            <div className="flex justify-center gap-6 mb-4 text-neutral-500">
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+91 9354339808</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>contact@stackit.com</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 text-neutral-500 mb-4">
              <a href="#" aria-label="GitHub"><span>🐙</span></a>
              <a href="#" aria-label="LinkedIn"><span>💼</span></a>
              <a href="#" aria-label="Twitter"><span>🐦</span></a>
            </div>
            <p className="text-neutral-500">© 2025 StackIt</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ title, icon, desc }) {
  return (
    <div className="border border-[#dbdbdb] rounded-lg p-4 bg-white">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-lg font-bold text-[#141414] mb-1">{title}</h3>
      <p className="text-sm text-neutral-500">{desc}</p>
    </div>
  );
}

function StepItem({ number, label }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">{number}</div>
      <p className="text-base text-[#141414]">{label}</p>
    </div>
  );
}

function TestimonialCard({ name, role, quote }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm text-left">
      <p className="text-base text-[#141414] mb-2">"{quote}"</p>
      <p className="text-sm text-neutral-500">{name}, {role}</p>
    </div>
  );
}
