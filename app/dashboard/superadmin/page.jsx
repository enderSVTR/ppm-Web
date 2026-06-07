"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const [reportFilter, setReportFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    ctzn_reg_number: "",
    password: "",
    role: "user",
  });
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    ctzn_reg_number: "",
    password: "",
    newPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("superadmin");
    if (!userData) {
      router.push("/login/superadmin");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "superadmin") {
      router.push("/login/superadmin");
      return;
    }
    setUser(parsedUser);
    fetchAllData();
    fetchProfile(parsedUser.id);
  }, [router]);

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setProfileForm({
          username: data.data.username || "",
          email: data.data.email || "",
          phone_number: data.data.phone_number || "",
          ctzn_reg_number: data.data.ctzn_reg_number || "",
          password: "",
          newPassword: "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch reports ketika filter berubah
  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    }
  }, [reportFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchReports(), fetchStats()]);
    } catch (err) {
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/superadmin/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchReports = async () => {
    try {
      let url = "/api/reports";
      if (reportFilter !== "all") {
        url += `?status=${reportFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/superadmin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: profileForm.username,
          email: profileForm.email,
          phone_number: profileForm.phone_number,
          password: profileForm.password,
          newPassword: profileForm.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Profile berhasil diperbarui");
        setEditingProfile(false);
        setProfileForm({ ...profileForm, password: "", newPassword: "" });
        fetchProfile(user.id);
        const updatedUser = {
          ...user,
          name: profileForm.username,
          email: profileForm.email,
        };
        localStorage.setItem("superadmin", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal menyimpan perubahan profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("User berhasil ditambahkan");
        setShowAddUser(false);
        setFormData({
          username: "",
          email: "",
          phone_number: "",
          ctzn_reg_number: "",
          password: "",
          role: "user",
        });
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal menambahkan user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/superadmin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("User berhasil diupdate");
        setEditingUser(null);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal mengupdate user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Hapus user "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/superadmin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("User berhasil dihapus");
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal menghapus user");
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      const res = await fetch("/api/superadmin/users/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Role berhasil diubah menjadi ${newRole}`);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal mengubah role");
    }
  };

  const handleDeleteReport = async (reportId, title) => {
    if (!confirm(`Hapus laporan "${title}"?`)) return;

    try {
      const res = await fetch(`/api/reports?reportId=${reportId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Laporan berhasil dihapus");
        fetchReports();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal menghapus laporan");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login/superadmin");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "superadmin":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
            Super Admin
          </span>
        );
      case "admin":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            Admin
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            User
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-bold text-blue-400">Re:</span>
          <span className="text-2xl font-bold text-white">PORTS</span>
          <span className="ml-2 text-sm text-gray-400">- Super Admin</span>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => {
              setActiveTab("reports");
              fetchReports();
            }}
            className={`px-3 py-1 rounded ${activeTab === "reports" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Reports
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              fetchUsers();
            }}
            className={`px-3 py-1 rounded ${activeTab === "users" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
            }}
            className={`px-3 py-1 rounded ${activeTab === "profile" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500">Welcome, {user.name || user.email}</p>
        </div>

        {/* Stats Cards - hanya tampil di tab reports */}
        {activeTab === "reports" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-xs">Total Laporan</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.pendingReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-xs">Approved</p>
              <p className="text-xl font-bold text-green-600">
                {stats.approvedReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-gray-500 text-xs">Rejected</p>
              <p className="text-xl font-bold text-red-600">
                {stats.rejectedReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
              <p className="text-gray-500 text-xs">Total Users</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
              <p className="text-gray-500 text-xs">Admin</p>
              <p className="text-xl font-bold text-teal-600">
                {stats.totalAdmins}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-gray-500 text-xs">Super Admin</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.totalSuperAdmins}
              </p>
            </div>
          </div>
        )}

        {/* Error & Success Messages */}
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

        {/* PROFILE SECTION */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow max-w-2xl mx-auto">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>
            </div>
            <div className="p-6">
              {!editingProfile ? (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-lg font-medium text-gray-900">
                      {profile?.username || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900">
                      {profile?.email || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-medium text-gray-900">
                      {profile?.phone_number || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">NIK</p>
                    <p className="text-lg font-medium text-gray-900">
                      {profile?.ctzn_reg_number || "-"}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                      value={profileForm.phone_number}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      NIK
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                      value={profileForm.ctzn_reg_number}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          ctzn_reg_number: e.target.value,
                        })
                      }
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
                          className="w-full px-3 py-2 border rounded-lg text-gray-900"
                          placeholder="Enter current password to change"
                          value={profileForm.password}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border rounded-lg text-gray-900"
                          placeholder="New password (min 6 characters)"
                          value={profileForm.newPassword}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setError("");
                        setSuccess("");
                        setProfileForm({
                          username: profile?.username || "",
                          email: profile?.email || "",
                          phone_number: profile?.phone_number || "",
                          ctzn_reg_number: profile?.ctzn_reg_number || "",
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
        )}

        {/* REPORTS SECTION */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                All Reports
              </h2>
              <select
                value={reportFilter}
                onChange={(e) => {
                  setReportFilter(e.target.value);
                }}
                className="px-3 py-1 border rounded-lg text-sm text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <p className="text-center py-20 text-gray-400">
                Loading reports...
              </p>
            ) : reports.length === 0 ? (
              <p className="text-center py-20 text-gray-400">
                No reports found
              </p>
            ) : (
              <div className="divide-y">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 break-words">
                          {report.title || `Report #${report.id}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          By: {report.reporter_name || "Unknown"} • Category:{" "}
                          {report.category_name} •{" "}
                          {new Date(
                            report.date || report.created_at,
                          ).toLocaleDateString("id-ID")}
                        </p>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2 break-words">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {getStatusBadge(report.status)}
                          {report.filepicked && (
                            <span className="text-xs text-gray-500">
                              📎 {report.filepicked}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteReport(report.id, report.title)
                        }
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS SECTION */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                + Add New User
              </button>
            </div>

            {loading ? (
              <p className="text-center py-20 text-gray-400">
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="text-center py-20 text-gray-400">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="p-3">ID</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">NIK</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u, index) => (
                      <tr
                        key={`${u.id}-${u.role}-${index}`}
                        className="text-sm"
                      >
                        <td className="p-3 text-gray-900">{u.id}</td>
                        <td className="p-3 font-medium text-gray-900">
                          {u.username}
                        </td>
                        <td className="p-3 text-gray-900">{u.email}</td>
                        <td className="p-3 text-gray-900">
                          {u.phone_number || "-"}
                        </td>
                        <td className="p-3 text-gray-900">
                          {u.ctzn_reg_number || "-"}
                        </td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleAssignRole(u.id, e.target.value)
                            }
                            className="text-xs border rounded px-1 py-0.5 text-gray-700"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL ADD USER - same as before */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIK
                </label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.ctzn_reg_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ctzn_reg_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={editingUser.phone_number || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIK
                </label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  value={editingUser.ctzn_reg_number || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      ctzn_reg_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="Leave blank to keep current password"
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
