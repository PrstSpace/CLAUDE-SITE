import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { parseTicketQrPayload } from "@/lib/qr";

export async function POST(request: NextRequest) {
  await requireAdminSession();

  const body = (await request.json().catch(() => null)) as
    | { scanned?: string; eventId?: string }
    | null;

  if (!body?.scanned) {
    return NextResponse.json({ ok: false, message: "Пустой QR-код" }, { status: 400 });
  }

  const token = parseTicketQrPayload(body.scanned);
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Это не билет PRST Events" },
      { status: 400 }
    );
  }

  const registration = await prisma.registration.findUnique({
    where: { ticketToken: token },
    include: { event: true },
  });

  if (!registration) {
    return NextResponse.json(
      { ok: false, message: "Билет не найден" },
      { status: 404 }
    );
  }

  if (body.eventId && registration.eventId !== body.eventId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Билет выдан на другое мероприятие: «${registration.event.title}»`,
      },
      { status: 409 }
    );
  }

  if (registration.status === "CHECKED_IN") {
    return NextResponse.json({
      ok: false,
      alreadyCheckedIn: true,
      message: "Билет уже был использован",
      registrant: {
        fullName: registration.fullName,
        company: registration.company,
        position: registration.position,
        checkedInAt: registration.checkedInAt,
      },
    });
  }

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { status: "CHECKED_IN", checkedInAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    message: "Вход разрешён",
    registrant: {
      fullName: updated.fullName,
      company: updated.company,
      position: updated.position,
      checkedInAt: updated.checkedInAt,
    },
  });
}
