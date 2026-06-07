import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "UserId diperlukan" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT id, username, email, phone_number, ctzn_reg_number, status, created_at 
       FROM users WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { userId, username, email, phone_number, password, newPassword } =
      await request.json();

    if (!userId || !username || !email) {
      return NextResponse.json(
        { success: false, message: "Username dan email wajib diisi" },
        { status: 400 },
      );
    }

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, userId],
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email sudah digunakan oleh user lain" },
        { status: 400 },
      );
    }

    let query = "UPDATE users SET username = $1, email = $2, phone_number = $3";
    let params = [username, email, phone_number || null];

    if (password && newPassword) {
      const userCheck = await pool.query(
        "SELECT password FROM users WHERE id = $1",
        [userId],
      );
      if (
        userCheck.rows.length === 0 ||
        userCheck.rows[0].password !== password
      ) {
        return NextResponse.json(
          { success: false, message: "Password saat ini salah" },
          { status: 401 },
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password baru minimal 6 karakter" },
          { status: 400 },
        );
      }
      query += ", password = $4";
      params.push(newPassword);
      query += " WHERE id = $5";
      params.push(userId);
    } else {
      query += " WHERE id = $4";
      params.push(userId);
    }

    await pool.query(query, params);

    return NextResponse.json({
      success: true,
      message: "Profile berhasil diperbarui",
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
