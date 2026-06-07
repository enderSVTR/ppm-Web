import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/Username/No. Telepon dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT id, username, email, phone_number, password, ctzn_reg_number, 'user' as role 
       FROM users 
       WHERE email = $1 OR username = $1 OR phone_number = $1`,
      [identifier],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/Username/No. Telepon atau password salah",
        },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/Username/No. Telepon atau password salah",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        ctzn_reg_number: user.ctzn_reg_number,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
