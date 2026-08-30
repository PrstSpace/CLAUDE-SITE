import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMskDatetimeLocalValue } from "@/lib/datetime";
import EventForm from "../EventForm";
import { initialEventFormState } from "../form-state";
import RegistrantsTable from "./RegistrantsTable";
import { updateEventAction } from "./actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { registrations: { orderBy: { createdAt: "desc" } } },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">{event.title}</h1>
          <Link
            href={`/admin/checkin/${event.id}`}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Открыть сканер входа
          </Link>
        </div>
        <EventForm
          action={updateEventAction.bind(null, event.id)}
          initialState={initialEventFormState}
          submitLabel="Сохранить изменения"
          defaultValues={{
            title: event.title,
            slug: event.slug,
            description: event.description ?? "",
            location: event.location ?? "",
            startsAt: toMskDatetimeLocalValue(event.startsAt),
            endsAt: event.endsAt ? toMskDatetimeLocalValue(event.endsAt) : "",
            isActive: event.isActive,
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Регистрации ({event.registrations.length})
          </h2>
          <a
            href={`/api/admin/events/${event.id}/export`}
            className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          >
            Экспорт в CSV
          </a>
        </div>
        <RegistrantsTable registrants={event.registrations} />
      </div>
    </div>
  );
}
