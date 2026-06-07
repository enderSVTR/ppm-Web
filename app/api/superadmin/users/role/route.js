import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: "UserId dan role wajib diisi" },
        { status: 400 },
      );
    }

    const allowedRoles = ["user", "admin", "superadmin"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 400 },
      );
    }

    const userCheck = await pool.query(
      "SELECT id, username, email, password, phone_number, ctzn_reg_number FROM users WHERE id = $1",
      [userId],
    );
    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const user = userCheck.rows[0];

    await pool.query("DELETE FROM Admin WHERE admin_id = $1", [userId]);
    await pool.query("DELETE FROM SuperAdmin WHERE superadmin_id = $1", [
      userId,
    ]);

    if (role === "admin") {
      await pool.query(
        "INSERT INTO Admin (email, password, admin_name, admin_id, status) VALUES ($1, $2, $3, $4, 'active')",
        [user.email, user.password, user.username, userId],
      );
    } else if (role === "superadmin") {
      await pool.query(
        "INSERT INTO SuperAdmin (email, password, superadmin_name, superadmin_id, status) VALUES ($1, $2, $3, $4, 'active')",
        [user.email, user.password, user.username, userId],
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role berhasil diubah menjadi ${role}`,
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
