"use client";

import { useState } from "react";
import { useLogin } from "@/hook/mutations/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, isError, error } = useLogin(); // ✅ hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: email,   // ✅ backend expects "username"
      password,
      rememberMe: true,
    });
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            placeholder="Enter password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      {isError && (
        <p className="mt-2 text-sm text-red-600">
          {error?.message || "Login failed"}
        </p>
      )}

      <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
