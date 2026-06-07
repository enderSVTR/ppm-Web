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
      `SELECT id, email, password, superadmin_name as name, superadmin_id as user_id, 'superadmin' as role 
       FROM SuperAdmin WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    const superAdmin = result.rows[0];

    if (password !== superAdmin.password) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil sebagai Super Admin",
      data: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        user_id: superAdmin.user_id,
      },
    });
  } catch (error) {
    console.error("Login superadmin error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
