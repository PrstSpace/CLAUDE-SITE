"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eventFormSchema } from "@/lib/validation";
import { requireAdminSession } from "@/lib/auth";
import { parseMskDatetimeLocal } from "@/lib/datetime";
import type { EventFormState } from "../form-state";

export async function createEventAction(
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

  const existing = await prisma.event.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return {
      status: "error",
      message: "Мероприятие с таким slug уже существует",
      fieldErrors: { slug: "Уже используется" },
    };
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      location: data.location || null,
      startsAt: parseMskDatetimeLocal(data.startsAt),
      endsAt: data.endsAt ? parseMskDatetimeLocal(data.endsAt) : null,
      isActive: data.isActive ?? true,
    },
  });

  redirect(`/admin/events/${event.id}`);
}
