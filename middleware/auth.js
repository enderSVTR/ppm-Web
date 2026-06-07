import { NextResponse } from "next/server";

export function isAuthenticated(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return false;
  }

  try {
    const userData = JSON.parse(token);
    return userData;
  } catch (error) {
    return false;
  }
}

export function redirectIfNotLoggedIn(request) {
  const user = isAuthenticated(request);

  if (!user) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return null;
}

export function redirectIfLoggedIn(request) {
  const user = isAuthenticated(request);

  if (user) {
    const role = user.role;
    let redirectUrl = "/myreports";
    if (role === "admin") redirectUrl = "/dashboard/admin";
    if (role === "superadmin") redirectUrl = "/dashboard/superadmin";

    const url = new URL(redirectUrl, request.url);
    return NextResponse.redirect(url);
  }

  return null;
}
