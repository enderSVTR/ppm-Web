"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("isLoggedIn", "true");
        router.push("/newreport");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-blue-600">Re:</span>
              <span className="text-2xl font-bold text-gray-800">PORTS</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Home
              </Link>
              <Link
                href="#features"
                className="text-gray-600 hover:text-blue-600"
              >
                Features
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-blue-600">
                About Us
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Account
                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <Link
                      href="/login/user"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-t border-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <button className="md:hidden text-gray-600">☰</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-blue-600">Re:PORTS</span>
              <br />
              <span className="text-gray-800">Public Complaint System</span>
            </h1>
            <div id="about" className="space-y-4">
              <p className="text-gray-600 text-lg leading-relaxed">
                <span className="font-semibold text-blue-600">Re:PORTS</span>{" "}
                (Reporting Ports for Public Complaints) adalah platform
                pengaduan masyarakat yang memudahkan warga untuk melaporkan
                berbagai permasalahan di lingkungan mereka secara cepat,
                transparan, dan terintegrasi.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Dengan sistem berbasis role (User, Admin, Super Admin), setiap
                laporan akan ditindaklanjuti oleh pihak berwenang melalui alur
                yang jelas—mulai dari status{" "}
                <span className="text-yellow-600 font-semibold">pending</span>,{" "}
                <span className="text-green-600 font-semibold">approved</span>,
                hingga{" "}
                <span className="text-red-600 font-semibold">rejected</span>.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Re:PORTS hadir untuk menjembatani aspirasi masyarakat dan
                pemerintah dalam menciptakan solusi nyata bagi lingkungan yang
                lebih baik.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Login</h2>
              <p className="text-gray-500 mt-1">
                Sign in to continue your session
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email / Username / No. Telepon
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder="Masukkan email, username, atau no. telepon"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Memproses..." : "Sign In"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24 md:mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Features
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Everything you need to report and track public complaints
            </p>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Laporan Cepat",
                desc: "Buat laporan dalam hitungan menit, lengkap dengan upload bukti foto.",
                color: "blue",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              },
              {
                title: "Tracking Realtime",
                desc: "Pantau status laporan: pending, approved, atau rejected secara langsung.",
                color: "green",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Komentar Publik",
                desc: "Berikan tanggapan dan dukungan pada laporan masyarakat lain.",
                color: "orange",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              },
              {
                title: "Notifikasi Email",
                desc: "Dapatkan notifikasi status laporan langsung di email Anda.",
                color: "red",
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
              {
                title: "Dashboard Statistik",
                desc: "Lihat ringkasan laporan per kategori dan per status.",
                color: "indigo",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div
                  className={`w-12 h-12 bg-${f.color}-100 rounded-lg flex items-center justify-center mb-4`}
                >
                  <svg
                    className={`w-6 h-6 text-${f.color}-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={f.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl font-bold text-blue-400">Re:</span>
              <span className="text-2xl font-bold text-white">PORTS</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">Contact: (+62) 85892229113</p>
              <p className="text-gray-400">@Re:PORTS_ID</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Re:PORTS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
