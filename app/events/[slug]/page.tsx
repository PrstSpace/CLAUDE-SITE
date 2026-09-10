import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Wordmark } from "@/app/_components/Wordmark";
import { HeroVideo } from "@/app/_components/HeroVideo";
import { formatEventDateRange } from "@/lib/datetime";
import RegistrationForm from "./RegistrationForm";

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
    <main className="flex min-h-screen flex-col">
      <div className="relative flex flex-col items-center gap-8 overflow-hidden bg-neutral-950 px-6 pb-14 pt-12 text-white">
        <HeroVideo />
        <Wordmark variant="dark" size="sm" className="relative" />
        <div className="relative flex max-w-lg flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
          <p className="text-sm text-neutral-400">
            {formatEventDateRange(event.startsAt, event.endsAt)}
          </p>
          {event.location && <p className="text-sm text-neutral-400">{event.location}</p>}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        {event.description && (
          <p className="whitespace-pre-line text-neutral-700">{event.description}</p>
        )}

        <h2 className="text-lg font-bold tracking-tight text-neutral-950">Регистрация</h2>

        {event.isActive ? (
          <RegistrationForm eventId={event.id} eventTitle={event.title} />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-neutral-700">
            Регистрация на это мероприятие закрыта.
          </div>
        )}
      </div>
    </main>
  );
}
