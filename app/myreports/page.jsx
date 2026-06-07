"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/user");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) fetchReports();
  }, [activeTab, user]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      // Kirim userId untuk filter report milik user yang login
      let url = `/api/reports?userId=${user.id}`;
      if (activeTab !== "all") {
        url += `&status=${activeTab}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || "Gagal mengambil data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    setUpdatingStatus(reportId);
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
      } else {
        alert(data.message || "Gagal mengupdate status");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleComment = async (reportId) => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentText,
          user_id: user.id,
          public_report_id: reportId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText("");
        setSelectedReport(null);
        fetchReports();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login/user");
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  if (!user) return <div className="p-8 text-center">Loading...</div>;

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
          <Link href="/profile" className="text-gray-600 hover:text-blue-600">
            profile
          </Link>
          <Link href="/newreport" className="text-gray-600 hover:text-blue-600">
            make new reports
          </Link>
          <Link href="/myreports" className="text-blue-600 font-semibold">
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome message dengan nama user */}
        <div className="mb-6">
          <p className="text-gray-500">
            Showing reports for:{" "}
            <span className="font-semibold text-gray-700">
              {user.name || user.email}
            </span>
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b pb-3">
          {["all", "rejected", "approved", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-sm font-medium transition ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            Error: {error}
          </div>
        )}

        {loading ? (
          <p className="text-center py-20 text-gray-400">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No reports found</p>
            <Link href="/newreport" className="text-blue-600 mt-2 inline-block">
              Create your first report
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {reports.map((report) => (
              <div key={report.id} className="border-b pb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 break-words">
                  {report.title || `Report #${report.id}`}
                </h2>
                <div className="text-gray-600 mb-4 break-words whitespace-pre-wrap">
                  {report.description}
                </div>
                {report.filepicked && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      uploads :
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 break-words">
                        📎 {report.filepicked}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() =>
                      isAdmin && updateStatus(report.id, "pending")
                    }
                    disabled={updatingStatus === report.id}
                    className={`px-4 py-1 text-sm rounded-full transition ${
                      report.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500 hover:bg-yellow-50"
                    } ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() =>
                      isAdmin && updateStatus(report.id, "rejected")
                    }
                    disabled={updatingStatus === report.id}
                    className={`px-4 py-1 text-sm rounded-full transition ${
                      report.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500 hover:bg-red-50"
                    } ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
                  >
                    declined
                  </button>
                  <button
                    onClick={() =>
                      isAdmin && updateStatus(report.id, "approved")
                    }
                    disabled={updatingStatus === report.id}
                    className={`px-4 py-1 text-sm rounded-full transition ${
                      report.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500 hover:bg-green-50"
                    } ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
                  >
                    Approved
                  </button>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-2">
                    {selectedReport === report.id ? (
                      <div>
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full p-3 border rounded-lg text-sm"
                          rows="3"
                          placeholder="Write comment..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleComment(report.id)}
                            disabled={submitting}
                            className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {submitting ? "Posting..." : "Post Comment"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(null);
                              setCommentText("");
                            }}
                            className="px-4 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
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
                        Add Comment
                      </button>
                    )}
                    {report.comments?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {report.comments.map((c) => (
                          <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 break-words">
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
                )}
                <p className="text-xs text-gray-400 mt-4">
                  {new Date(
                    report.date || report.created_at,
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
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
