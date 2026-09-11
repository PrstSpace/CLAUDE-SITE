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
    <main className="relative flex min-h-screen flex-col bg-neutral-950 text-white">
      <div className="fixed inset-0">
        <HeroVideo />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-14">
        <Wordmark variant="dark" size="lg" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
          <p className="text-sm text-neutral-300">
            {formatEventDateRange(event.startsAt, event.endsAt)}
          </p>
          {event.location && <p className="text-sm text-neutral-300">{event.location}</p>}
        </div>

        {event.description && (
          <p className="whitespace-pre-line text-center text-neutral-300">
            {event.description}
          </p>
        )}

        <div className="flex w-full flex-col gap-6">
          <h2 className="text-lg font-bold tracking-tight text-white">Регистрация</h2>

          {event.isActive ? (
            <RegistrationForm eventId={event.id} eventTitle={event.title} />
          ) : (
            <div className="rounded-lg border border-white/20 bg-black/30 p-6 text-neutral-300 backdrop-blur-sm">
              Регистрация на это мероприятие закрыта.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
