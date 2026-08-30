"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import type { LoginState } from "./form-state";

export async function loginAction(
  redirectTo: string,
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Введите email и пароль" };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { status: "error", message: "Неверный email или пароль" };
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return { status: "error", message: "Неверный email или пароль" };
  }

  await createAdminSession({ adminId: admin.id, email: admin.email });
  redirect(redirectTo || "/admin");
}
