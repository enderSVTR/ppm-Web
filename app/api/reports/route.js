import pool from "@/lib/database";
import { NextResponse } from "next/server";

// GET: Ambil laporan (bisa filter by userId dan status)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    let query = `
      SELECT 
        pr.id, 
        pr.date, 
        pr.title, 
        pr.description, 
        pr.filepicked, 
        pr.status, 
        pr.created_at,
        c.category_name,
        u.username as reporter_name,
        u.id as user_id
      FROM public_report pr
      LEFT JOIN categories c ON pr.category_id = c.id
      LEFT JOIN users u ON pr.ctzn_reg_number = u.ctzn_reg_number
      WHERE 1=1
    `;
    const params = [];

    // Filter berdasarkan userId (hanya report milik user yang login)
    if (userId) {
      query += ` AND u.id = $${params.length + 1}`;
      params.push(userId);
    }

    // Filter berdasarkan status
    if (status && status !== "all") {
      query += ` AND pr.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY pr.created_at DESC`;

    const result = await pool.query(query, params);

    // Ambil comments untuk setiap report
    for (let report of result.rows) {
      const commentsResult = await pool.query(
        `SELECT 
          c.id, 
          c.body, 
          c.User_id, 
          c.created_at, 
          u.username as user_name 
        FROM Comments c
        LEFT JOIN users u ON c.User_id = u.id
        WHERE c.public_report_id = $1
        ORDER BY c.created_at ASC`,
        [report.id],
      );
      report.comments = commentsResult.rows;
    }

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("GET reports error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data laporan: " + error.message,
      },
      { status: 500 },
    );
  }
}

// POST: Buat laporan baru
export async function POST(request) {
  try {
    const {
      date,
      title,
      ctzn_reg_number,
      category_id,
      description,
      filepicked,
      status,
    } = await request.json();

    // Validasi input
    if (!date || !title || !ctzn_reg_number || !category_id || !description) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO public_report (date, title, ctzn_reg_number, category_id, description, filepicked, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        date,
        title,
        ctzn_reg_number,
        category_id,
        description,
        filepicked || null,
        status || "pending",
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil disimpan",
      data: { id: result.rows[0].id },
    });
  } catch (error) {
    console.error("POST report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server: " + error.message,
      },
      { status: 500 },
    );
  }
}

// PUT: Update status laporan (approve/reject/pending)
export async function PUT(request) {
  try {
    const { reportId, status } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, message: "reportId dan status wajib diisi" },
        { status: 400 },
      );
    }

    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 },
      );
    }

    // Cek apakah report ada
    const checkReport = await pool.query(
      "SELECT id FROM public_report WHERE id = $1",
      [reportId],
    );
    if (checkReport.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 },
      );
    }

    await pool.query("UPDATE public_report SET status = $1 WHERE id = $2", [
      status,
      reportId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Status berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server: " + error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE: Hapus laporan (hanya untuk superadmin)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: "reportId wajib diisi" },
        { status: 400 },
      );
    }

    // Cek apakah report ada
    const checkReport = await pool.query(
      "SELECT id FROM public_report WHERE id = $1",
      [reportId],
    );
    if (checkReport.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 },
      );
    }

    await pool.query("DELETE FROM public_report WHERE id = $1", [reportId]);

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server: " + error.message,
      },
      { status: 500 },
    );
  }
}
