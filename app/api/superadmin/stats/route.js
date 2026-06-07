import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalReports = await pool.query(
      "SELECT COUNT(*) as count FROM public_report",
    );
    const pendingReports = await pool.query(
      "SELECT COUNT(*) as count FROM public_report WHERE status = 'pending'",
    );
    const approvedReports = await pool.query(
      "SELECT COUNT(*) as count FROM public_report WHERE status = 'approved'",
    );
    const rejectedReports = await pool.query(
      "SELECT COUNT(*) as count FROM public_report WHERE status = 'rejected'",
    );
    const totalUsers = await pool.query("SELECT COUNT(*) as count FROM users");
    const totalAdmins = await pool.query("SELECT COUNT(*) as count FROM Admin");
    const totalSuperAdmins = await pool.query(
      "SELECT COUNT(*) as count FROM SuperAdmin",
    );

    return NextResponse.json({
      success: true,
      data: {
        totalReports: parseInt(totalReports.rows[0].count),
        pendingReports: parseInt(pendingReports.rows[0].count),
        approvedReports: parseInt(approvedReports.rows[0].count),
        rejectedReports: parseInt(rejectedReports.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalAdmins: parseInt(totalAdmins.rows[0].count),
        totalSuperAdmins: parseInt(totalSuperAdmins.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
