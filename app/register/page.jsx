"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    ctzn_reg_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        router.push("/login/user?registered=true");
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
          <h2 className="mt-6 text-2xl font-bold text-gray-900">REGISTER</h2>
          <p className="mt-2 text-sm text-gray-500">create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="viktor1234"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="example23@hotmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              name="phone_number"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="(+62) 8111111111"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Citizen Registration Number
            </label>
            <input
              name="ctzn_reg_number"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="00112223311"
              value={formData.ctzn_reg_number}
              onChange={handleChange}
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
          already have an account?{" "}
          <Link href="/login/user" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
