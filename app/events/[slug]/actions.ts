"use server";

import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validation";
import { generateTicketQrPngBase64 } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";
import type { RegisterState } from "./form-state";

// IP и User-Agent запроса — доказательство того, что согласия (в т.ч. на
// рекламную рассылку) дал сам посетитель, а не оператор сам себя подписал.
async function getConsentMetadata() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || headersList.get("x-real-ip") || null;
  const userAgent = headersList.get("user-agent");
  return { ip, userAgent };
}

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
    marketingConsent: formData.get("marketingConsent"),
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

  // Явная дополнительная проверка (помимо схемы валидации): без согласия на
  // обработку персональных данных билет не выдаётся ни при каких условиях.
  if (!data.consentGiven) {
    return {
      status: "error",
      message: "Регистрация невозможна без согласия на обработку персональных данных",
      fieldErrors: {
        consentGiven: "Необходимо согласие на обработку персональных данных",
      },
    };
  }

  const ticketToken = nanoid(24);
  const { ip, userAgent } = await getConsentMetadata();

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      company: data.company,
      position: data.position,
      consentGiven: data.consentGiven,
      marketingConsent: data.marketingConsent,
      consentIp: ip,
      consentUserAgent: userAgent,
      ticketToken,
    },
  });

  const qrPngBase64 = await generateTicketQrPngBase64(ticketToken);
  const qrDataUrl = `data:image/png;base64,${qrPngBase64}`;

  try {
    await sendTicketEmail({
      to: data.email,
      fullName: data.fullName,
      eventTitle: event.title,
      eventLocation: event.location,
      eventStartsAt: event.startsAt,
      eventEndsAt: event.endsAt,
      qrPngBase64,
      consentGivenAt: registration.createdAt,
      marketingConsent: data.marketingConsent,
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
        "Регистрация подтверждена, но письмо с билетом отправить не удалось. Сохраните QR-код ниже — он и есть ваш билет.",
      qrDataUrl,
    };
  }

  return {
    status: "success",
    message: `Регистрация подтверждена! Билет с QR-кодом отправлен на ${data.email}. Он также показан ниже.`,
    qrDataUrl,
  };
}
