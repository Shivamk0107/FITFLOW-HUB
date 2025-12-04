import React, { useState } from 'react';
import { FitFlowLogo, LoadingIcon, EyeIcon } from './icons/ControlIcons';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Login failed");

      // ✅ Save JWT token and user data to localStorage
      if (data.token) localStorage.setItem("fitflow_token", data.token);
      if (data.user) localStorage.setItem("fitflow_user", JSON.stringify(data.user));
      else localStorage.setItem("fitflow_user", JSON.stringify(data));

      console.log("✅ Token saved:", data.token);
      console.log("✅ User saved:", data.user || data);

      onLogin(data.user || data);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <FitFlowLogo className="h-16 mx-auto mb-10" lightText />
        <h1 className="text-3xl sm:text-4xl font-bold">Welcome Back</h1>
        <p className="text-zinc-400 mt-2">Login to continue your fitness journey</p>

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4 mt-8">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300"
            required
          />

          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-400 hover:text-white"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-lime-300 text-black font-bold py-3 px-4 rounded-full hover:bg-lime-400 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? <LoadingIcon /> : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don’t have an account?{' '}
          <button onClick={onNavigateToSignUp} className="font-bold text-lime-300 hover:underline focus:outline-none">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
