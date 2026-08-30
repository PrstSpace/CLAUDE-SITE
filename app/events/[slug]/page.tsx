import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegistrationForm from "./RegistrationForm";

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{event.title}</h1>
        <p className="mt-1 text-neutral-600">{formatEventDate(event.startsAt)}</p>
        {event.location && <p className="text-neutral-600">{event.location}</p>}
        {event.description && (
          <p className="mt-3 whitespace-pre-line text-neutral-700">{event.description}</p>
        )}
      </div>

      {event.isActive ? (
        <RegistrationForm eventId={event.id} />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-neutral-700">
          Регистрация на это мероприятие закрыта.
        </div>
      )}
    </main>
  );
}
