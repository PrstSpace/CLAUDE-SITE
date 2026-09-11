import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/events/[id]/export">
) {
  await requireAdminSession();
  const { id } = await ctx.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "ФИО",
    "Телефон",
    "Email",
    "Компания",
    "Должность",
    "Статус",
    "Дата регистрации",
    "Дата входа",
    "Согласие на обработку ПД",
    "Согласие на рекламную рассылку",
    "IP согласия",
    "User-Agent согласия",
  ];

  const rows = registrations.map((r) => [
    r.fullName,
    r.phone,
    r.email,
    r.company,
    r.position,
    r.status === "CHECKED_IN" ? "Прошёл вход" : "Зарегистрирован",
    r.createdAt.toISOString(),
    r.checkedInAt ? r.checkedInAt.toISOString() : "",
    r.consentGiven ? "да" : "нет",
    r.marketingConsent ? "да" : "нет",
    r.consentIp ?? "",
    r.consentUserAgent ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(";"))
    .join("\n");

  const bom = "﻿";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-registrations.csv"`,
    },
  });
}
