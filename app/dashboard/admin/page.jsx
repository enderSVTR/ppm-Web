"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const [reportFilter, setReportFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    ctzn_reg_number: "",
    password: "",
    newPassword: "",
  });

  // Ambil data user dari localStorage "admin"
  useEffect(() => {
    const userData = localStorage.getItem("admin");
    if (!userData) {
      router.push("/login/admin");
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      console.log("Admin user data:", parsedUser);
      if (parsedUser.role !== "admin" && parsedUser.role !== "superadmin") {
        router.push("/login/admin");
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      console.error("Parse error:", err);
      router.push("/login/admin");
    }
  }, [router]);

  // Fetch profile dari API users/profile menggunakan admin_id yang benar
  useEffect(() => {
    if (user && (user.user_id || user.id)) {
      const adminId = user.user_id || user.id;
      console.log("Admin ID to fetch:", adminId);
      fetchProfile(adminId);
    }
  }, [user]);

  const fetchProfile = async (adminId) => {
    console.log("Fetching profile for adminId:", adminId);
    try {
      const res = await fetch(`/api/users/profile?userId=${adminId}`);
      const data = await res.json();
      console.log("Profile API response:", data);
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
      } else {
        console.error("Profile API error:", data.message);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/reports";
      if (reportFilter !== "all") {
        url += `?status=${reportFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || "Gagal mengambil data laporan");
      }
    } catch (err) {
      setError("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "reports" && user) {
      fetchReports();
    }
  }, [reportFilter, activeTab, user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const updateStatus = async (reportId, newStatus) => {
    setUpdatingStatus(reportId);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Status laporan berhasil diubah menjadi ${newStatus}`);
        await Promise.all([fetchReports(), fetchStats()]);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Gagal mengupdate status");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleComment = async (reportId) => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentText,
          user_id: user.id,
          user_role: user.role,
          public_report_id: reportId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Komentar berhasil ditambahkan");
        setCommentText("");
        setSelectedReport(null);
        await fetchReports();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
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
          userId: user.user_id || user.id,
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
        fetchProfile(user.user_id || user.id);
        const updatedUser = {
          ...user,
          name: profileForm.username,
          email: profileForm.email,
        };
        localStorage.setItem("admin", JSON.stringify(updatedUser));
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

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login/admin");
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
      {/* Navbar - SAMA SEPERTI SEBELUMNYA, TIDAK BERUBAH */}
      <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-bold text-blue-400">Re:</span>
          <span className="text-2xl font-bold text-white">PORTS</span>
          <span className="ml-2 text-sm text-gray-400">- Admin Panel</span>
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
            onClick={() => setActiveTab("profile")}
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

      {/* Main Content - SAMA SEPERTI SEBELUMNYA, TIDAK BERUBAH */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 break-words">
            Welcome, {user.name || user.email}
          </p>
        </div>

        {activeTab === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Total Laporan</p>
              <p className="text-2xl font-bold text-gray-900 break-words">
                {stats.totalReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 break-words">
                {stats.pendingReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600 break-words">
                {stats.approvedReports}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600 break-words">
                {stats.rejectedReports}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm break-words">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm break-words">
            {success}
          </div>
        )}

        {/* PROFILE SECTION - HANYA INI YANG DIREMAKE */}
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
                    <p className="text-lg font-medium text-gray-900 break-words">
                      {profile?.username || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900 break-words">
                      {profile?.email || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-medium text-gray-900 break-words">
                      {profile?.phone_number || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">NIK</p>
                    <p className="text-lg font-medium text-gray-900 break-words">
                      {profile?.ctzn_reg_number || "-"}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

        {/* REPORTS SECTION - SAMA SEPERTI SEBELUMNYA */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-800">
                All Reports
              </h2>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
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
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-800 break-words">
                        {report.title || `Report #${report.id}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        By: {report.reporter_name || "Unknown"} • Category:{" "}
                        {report.category_name} •{" "}
                        {new Date(
                          report.date || report.created_at,
                        ).toLocaleDateString("id-ID")}
                      </p>
                      <p className="text-gray-600 text-sm mt-2 break-words whitespace-pre-wrap">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {getStatusBadge(report.status)}
                        {report.filepicked && (
                          <span className="text-xs text-gray-500 break-words">
                            📎 {report.filepicked}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 mt-3 flex-wrap">
                        <button
                          onClick={() => updateStatus(report.id, "approved")}
                          disabled={
                            updatingStatus === report.id ||
                            report.status === "approved"
                          }
                          className={`px-3 py-1 text-xs rounded transition ${report.status === "approved" ? "bg-green-100 text-green-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                        >
                          {updatingStatus === report.id
                            ? "Processing..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, "rejected")}
                          disabled={
                            updatingStatus === report.id ||
                            report.status === "rejected"
                          }
                          className={`px-3 py-1 text-xs rounded transition ${report.status === "rejected" ? "bg-red-100 text-red-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                        >
                          {updatingStatus === report.id
                            ? "Processing..."
                            : "Reject"}
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, "pending")}
                          disabled={
                            updatingStatus === report.id ||
                            report.status === "pending"
                          }
                          className={`px-3 py-1 text-xs rounded transition ${report.status === "pending" ? "bg-yellow-100 text-yellow-500 cursor-not-allowed" : "bg-yellow-600 text-white hover:bg-yellow-700"}`}
                        >
                          Pending
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Admin Comments
                        </h4>

                        {selectedReport === report.id ? (
                          <div>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                              rows="3"
                              placeholder="Write comment..."
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleComment(report.id)}
                                disabled={submitting}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                              >
                                {submitting ? "Posting..." : "Post Comment"}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReport(null);
                                  setCommentText("");
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedReport(report.id)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            + Add Comment
                          </button>
                        )}

                        {report.comments?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {report.comments.map((c) => (
                              <div
                                key={c.id}
                                className="bg-gray-50 p-2 rounded text-sm"
                              >
                                <p className="text-gray-700 break-words whitespace-pre-wrap">
                                  {c.body}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  By: {c.user_name || "Admin"} •{" "}
                                  {new Date(c.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
