"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewReportPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
    filepicked: null,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/user");
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch (e) {
      router.push("/login/user");
    }
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0)
          setSelectedCategory(data.data[0].id.toString());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) =>
    setFormData({ ...formData, filepicked: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!formData.date) {
      setError("Tanggal kejadian wajib diisi");
      setLoading(false);
      return;
    }
    if (!formData.title) {
      setError("Judul laporan wajib diisi");
      setLoading(false);
      return;
    }
    if (!formData.description) {
      setError("Deskripsi kejadian wajib diisi");
      setLoading(false);
      return;
    }
    if (!selectedCategory) {
      setError("Kategori wajib dipilih");
      setLoading(false);
      return;
    }
    if (!user?.ctzn_reg_number) {
      setError("Data NIK user tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      const reportData = {
        date: formData.date,
        title: formData.title,
        ctzn_reg_number: user.ctzn_reg_number,
        category_id: parseInt(selectedCategory),
        description: formData.description,
        filepicked: formData.filepicked ? formData.filepicked.name : null,
        status: "pending",
      };
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Laporan berhasil dikirim!");
        setFormData({ date: "", title: "", description: "", filepicked: null });
        setSelectedCategory(categories[0]?.id.toString() || "");
        setTimeout(() => router.push("/myreports"), 2000);
      } else {
        setError(result.message || "Gagal mengirim laporan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login/user");
  };
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );

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
                landing page
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-blue-600"
              >
                profile
              </Link>
              <Link href="/newreport" className="font-semibold text-blue-600">
                make new reports
              </Link>
              <Link
                href="/myreports"
                className="text-gray-600 hover:text-blue-600"
              >
                My reports
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                logout
              </button>
            </div>
            <button className="md:hidden text-gray-600">☰</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Re:PORTS</h1>
          <p className="text-gray-500 mt-1">
            Welcome, {user.name || user.email}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              make new reports
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  date of incident
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  placeholder="your title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  incident chronology
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 resize-none"
                  placeholder="Describe the incident in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  upload file/photo/etc
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF, DOC (max 5MB)
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {loading ? "Processing..." : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      date: "",
                      title: "",
                      description: "",
                      filepicked: null,
                    })
                  }
                  className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  Private
                </button>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                * Laporan Anda akan segera diproses oleh admin
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-12 py-8">
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
