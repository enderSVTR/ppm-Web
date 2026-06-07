"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    newPassword: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/user");
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProfile(parsedUser.id);
    } catch (err) {
      router.push("/login/user");
    }
  }, [router]);

  const fetchProfile = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          username: data.data.username || "",
          email: data.data.email || "",
          phone_number: data.data.phone_number || "",
          password: "",
          newPassword: "",
        });
      } else setError(data.message);
    } catch (err) {
      setError("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          newPassword: formData.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Profil berhasil diperbarui");
        setEditing(false);
        setFormData({ ...formData, password: "", newPassword: "" });
        fetchProfile(user.id);
        const updatedUser = {
          ...user,
          name: formData.username,
          email: formData.email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else setError(data.message);
    } catch (err) {
      setError("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login/user");
  };
  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-bold text-blue-600">Re:</span>
          <span className="text-2xl font-bold text-gray-800">PORTS</span>
        </div>
        <div className="space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600">
            landing page
          </Link>
          <Link href="/profile" className="text-blue-600 font-semibold">
            profile
          </Link>
          <Link href="/newreport" className="text-gray-600 hover:text-blue-600">
            make new reports
          </Link>
          <Link href="/myreports" className="text-gray-600 hover:text-blue-600">
            My reports
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
          <div className="p-6">
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

            {!editing ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-lg font-medium text-gray-800">
                    {profile?.username || "-"}
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-800">
                    {profile?.email || "-"}
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {profile?.phone_number || "-"}
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">NIK</p>
                  <p className="text-lg font-medium text-gray-800">
                    {profile?.ctzn_reg_number || "-"}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Change Password (optional)
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="New password (min 6 characters)"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setSuccess("");
                      setFormData({
                        username: profile?.username || "",
                        email: profile?.email || "",
                        phone_number: profile?.phone_number || "",
                        password: "",
                        newPassword: "",
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span className="text-xl font-bold text-blue-400">Re:</span>
            <span className="text-xl font-bold text-white">PORTS</span>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-400">Contact: (+62) 85892229113</p>
            <p className="text-gray-400">@Re:PORTS_ID</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
