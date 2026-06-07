import pool from "@/lib/database";
import { NextResponse } from "next/server";

// GET: Ambil semua user (user biasa, admin, superadmin)
export async function GET() {
  try {
    const users = await pool.query(
      "SELECT id, username, email, phone_number, ctzn_reg_number, status, created_at, 'user' as role FROM users",
    );

    const admins = await pool.query(
      "SELECT a.id, u.username, a.email, u.phone_number, u.ctzn_reg_number, u.status, u.created_at, 'admin' as role FROM Admin a JOIN users u ON a.admin_id = u.id",
    );

    const superAdmins = await pool.query(
      "SELECT s.id, u.username, s.email, u.phone_number, u.ctzn_reg_number, u.status, u.created_at, 'superadmin' as role FROM SuperAdmin s JOIN users u ON s.superadmin_id = u.id",
    );

    const allUsers = [...users.rows, ...admins.rows, ...superAdmins.rows];
    return NextResponse.json({ success: true, data: allUsers });
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// POST: Tambah user baru
export async function POST(request) {
  try {
    const { username, email, phone_number, ctzn_reg_number, password, role } =
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

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    const usernameCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );
    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah terdaftar" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, phone_number, ctzn_reg_number, password, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING id`,
      [
        username,
        email,
        phone_number || null,
        ctzn_reg_number || null,
        password,
      ],
    );
    const userId = result.rows[0].id;

    if (role === "admin") {
      await pool.query(
        "INSERT INTO Admin (email, password, admin_name, admin_id, status) VALUES ($1, $2, $3, $4, 'active')",
        [email, password, username, userId],
      );
    } else if (role === "superadmin") {
      await pool.query(
        "INSERT INTO SuperAdmin (email, password, superadmin_name, superadmin_id, status) VALUES ($1, $2, $3, $4, 'active')",
        [email, password, username, userId],
      );
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil ditambahkan",
    });
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// PUT: Update user
export async function PUT(request) {
  try {
    const { id, username, email, phone_number, ctzn_reg_number, newPassword } =
      await request.json();

    if (!id || !username || !email) {
      return NextResponse.json(
        { success: false, message: "ID, username, dan email wajib diisi" },
        { status: 400 },
      );
    }

    let query =
      "UPDATE users SET username = $1, email = $2, phone_number = $3, ctzn_reg_number = $4";
    let params = [
      username,
      email,
      phone_number || null,
      ctzn_reg_number || null,
    ];

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password minimal 6 karakter" },
          { status: 400 },
        );
      }
      query += ", password = $5 WHERE id = $6";
      params.push(newPassword, id);
    } else {
      query += " WHERE id = $5";
      params.push(id);
    }

    await pool.query(query, params);

    return NextResponse.json({
      success: true,
      message: "User berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// DELETE: Hapus user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "UserId diperlukan" },
        { status: 400 },
      );
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
