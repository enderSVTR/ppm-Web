import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT id, email, password, admin_name as name, admin_id as user_id, 'admin' as role 
       FROM Admin WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    const admin = result.rows[0];

    if (password !== admin.password) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil sebagai Admin",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        user_id: admin.user_id,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
