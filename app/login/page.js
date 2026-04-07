"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(username, password);
      if (res.success) {
        login(res.user);
        router.push("/dashboard");
      } else {
        setError(res.message || "Invalid username or password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Oxygen Flow</h1>
          <p className="text-gray-400 text-sm mt-1">Team Management System</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your username"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Oxygen Flow Management © 2026
        </p>
      </div>
    </div>
  );
}
