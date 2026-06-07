import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, email, phone_number, ctzn_reg_number, password } =
      await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email, dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    const existingUsername = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah terdaftar" },
        { status: 400 },
      );
    }

    if (phone_number) {
      const existingPhone = await pool.query(
        "SELECT id FROM users WHERE phone_number = $1",
        [phone_number],
      );
      if (existingPhone.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: "Nomor telepon sudah terdaftar" },
          { status: 400 },
        );
      }
    }

    await pool.query(
      `INSERT INTO users (username, email, phone_number, ctzn_reg_number, password, status) 
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      [
        username,
        email,
        phone_number || null,
        ctzn_reg_number || null,
        password,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
