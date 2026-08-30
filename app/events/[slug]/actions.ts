"use server";

import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validation";
import { generateTicketQrPngBase64 } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";
import type { RegisterState } from "./form-state";

export async function registerForEvent(
  eventId: string,
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    company: formData.get("company"),
    position: formData.get("position"),
    consentGiven: formData.get("consentGiven"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Проверьте правильность заполнения формы",
      fieldErrors,
    };
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isActive) {
    return {
      status: "error",
      message: "Регистрация на это мероприятие сейчас недоступна",
    };
  }

  const data = parsed.data;
  const ticketToken = nanoid(24);

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      company: data.company,
      position: data.position,
      consentGiven: data.consentGiven,
      ticketToken,
    },
  });

  try {
    const qrPngBase64 = await generateTicketQrPngBase64(ticketToken);
    await sendTicketEmail({
      to: data.email,
      fullName: data.fullName,
      eventTitle: event.title,
      eventLocation: event.location,
      eventStartsAt: event.startsAt,
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
    return {
      status: "success",
      message:
        "Регистрация подтверждена, но письмо с билетом отправить не удалось. Обратитесь к организаторам — билет можно выдать вручную по вашему имени.",
    };
  }

  return {
    status: "success",
    message: `Регистрация подтверждена! Билет с QR-кодом отправлен на ${data.email}.`,
  };
}
