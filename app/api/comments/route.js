import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { body, user_id, user_role, public_report_id } = await request.json();

    console.log("Comment request:", {
      body,
      user_id,
      user_role,
      public_report_id,
    });

    if (!body || !user_id || !public_report_id) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    // Cek role dari data yang dikirim frontend
    if (user_role !== "admin" && user_role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat memberikan komentar",
        },
        { status: 403 },
      );
    }

    // Insert komentar
    const result = await pool.query(
      `INSERT INTO Comments (body, User_id, public_report_id) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [body, user_id, public_report_id],
    );

    console.log("Insert result:", result.rows);

    return NextResponse.json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: { id: result.rows[0].id },
    });
  } catch (error) {
    console.error("POST comment error DETAIL:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan pada server",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: "reportId wajib diisi" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT c.id, c.body, c.User_id, c.created_at, u.username as user_name 
       FROM Comments c
       LEFT JOIN users u ON c.User_id = u.id
       WHERE c.public_report_id = $1
       ORDER BY c.created_at ASC`,
      [reportId],
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
