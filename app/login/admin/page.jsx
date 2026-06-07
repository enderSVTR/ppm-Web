"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem("admin", JSON.stringify(result.data));
        document.cookie = `token=${JSON.stringify(result.data)}; path=/`;
        router.push("/dashboard/admin");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-1">
            <span className="text-3xl font-bold text-blue-600">Re:</span>
            <span className="text-3xl font-bold text-gray-800">PORTS</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">ADMIN LOGIN</h2>
          <p className="mt-2 text-sm text-gray-500">sign in as administrator</p>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/login/user"
            className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            User
          </Link>
          <Link
            href="/login/admin"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Admin
          </Link>
          <Link
            href="/login/superadmin"
            className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            Super Admin
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Login as Admin</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 ${loading ? "opacity-50" : ""}`}
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login/user" className="text-blue-600 hover:underline">
            ← Back to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}
