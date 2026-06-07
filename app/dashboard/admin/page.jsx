"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let userData = localStorage.getItem("admin");
    if (!userData) {
      userData = localStorage.getItem("user");
    }
    if (!userData) {
      router.push("/login/admin");
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      console.log("Logged in user:", parsedUser);
      if (parsedUser.role !== "admin" && parsedUser.role !== "superadmin") {
        router.push("/login/admin");
        return;
      }
      setUser(parsedUser);
      fetchAllData();
    } catch (err) {
      console.error("Parse error:", err);
      router.push("/login/admin");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [reportFilter, user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchReports(), fetchStats()]);
    } catch (err) {
      console.error("Fetch all data error:", err);
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      let url = "/api/reports";
      if (reportFilter !== "all") {
        url += `?status=${reportFilter}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || "Gagal mengambil data laporan");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Gagal mengambil data laporan: " + err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        console.error("Stats API error:", data.message);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

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
      console.error(err);
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
          user_role: user.role, // Kirim role juga
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
      console.error("Comment error:", err);
      setError("Gagal mengirim komentar: " + err.message);
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
      <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-bold text-blue-400">Re:</span>
          <span className="text-2xl font-bold text-white">PORTS</span>
          <span className="ml-2 text-sm text-gray-400">- Admin Panel</span>
        </div>
        <div className="space-x-4">
          <Link
            href="/dashboard/admin"
            className="px-3 py-1 rounded bg-blue-600"
          >
            Dashboard
          </Link>
          <Link href="/profile" className="px-3 py-1 rounded hover:bg-gray-700">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome, {user.name || user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Laporan</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalReports}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingReports}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.approvedReports}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.rejectedReports}
            </p>
          </div>
        </div>

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

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">All Reports</h2>
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
            <p className="text-center py-20 text-gray-400">No reports found</p>
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
                      <p className="text-gray-600 text-sm mt-2 break-words">
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

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => updateStatus(report.id, "approved")}
                          disabled={
                            updatingStatus === report.id ||
                            report.status === "approved"
                          }
                          className={`px-3 py-1 text-xs rounded transition ${
                            report.status === "approved"
                              ? "bg-green-100 text-green-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
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
                          className={`px-3 py-1 text-xs rounded transition ${
                            report.status === "rejected"
                              ? "bg-red-100 text-red-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
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
                          className={`px-3 py-1 text-xs rounded transition ${
                            report.status === "pending"
                              ? "bg-yellow-100 text-yellow-500 cursor-not-allowed"
                              : "bg-yellow-600 text-white hover:bg-yellow-700"
                          }`}
                        >
                          Pending
                        </button>
                      </div>

                      {/* Comment Section */}
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
                                <p className="text-gray-700 break-words">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
