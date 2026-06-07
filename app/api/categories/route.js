import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, category_name, description FROM categories ORDER BY id",
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kategori" },
      { status: 500 },
    );
  }
}
