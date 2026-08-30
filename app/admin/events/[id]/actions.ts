"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { eventFormSchema } from "@/lib/validation";
import { requireAdminSession } from "@/lib/auth";
import { parseMskDatetimeLocal } from "@/lib/datetime";
import { generateTicketQrPngBase64 } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";
import type { EventFormState } from "../form-state";

export async function updateEventAction(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdminSession();

  const parsed = eventFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", message: "Проверьте поля формы", fieldErrors };
  }

  const data = parsed.data;

  const conflict = await prisma.event.findFirst({
    where: { slug: data.slug, NOT: { id: eventId } },
  });
  if (conflict) {
    return {
      status: "error",
      message: "Мероприятие с таким slug уже существует",
      fieldErrors: { slug: "Уже используется" },
    };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      location: data.location || null,
      startsAt: parseMskDatetimeLocal(data.startsAt),
      endsAt: data.endsAt ? parseMskDatetimeLocal(data.endsAt) : null,
      isActive: data.isActive ?? false,
    },
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { status: "idle" };
}

export async function resendTicketEmailAction(registrationId: string) {
  await requireAdminSession();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  });
  if (!registration) return;

  try {
    const qrPngBase64 = await generateTicketQrPngBase64(registration.ticketToken);
    await sendTicketEmail({
      to: registration.email,
      fullName: registration.fullName,
      eventTitle: registration.event.title,
      eventLocation: registration.event.location,
      eventStartsAt: registration.event.startsAt,
      qrPngBase64,
    });
    await prisma.registration.update({
      where: { id: registration.id },
      data: { emailSentAt: new Date(), emailError: null },
    });
  } catch (err) {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { emailError: err instanceof Error ? err.message : String(err) },
    });
  }

  revalidatePath(`/admin/events/${registration.eventId}`);
}
