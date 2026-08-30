import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Scanner from "./Scanner";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdminSession();
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">
        Сканер входа — {event.title}
      </h1>
      <p className="max-w-sm text-center text-sm text-neutral-600">
        Наведите камеру на QR-код билета участника.
      </p>
      <Scanner eventId={event.id} />
    </div>
  );
}
