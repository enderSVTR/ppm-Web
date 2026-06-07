import pool from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() as now");
    return NextResponse.json({
      success: true,
      time: result.rows[0].now,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
