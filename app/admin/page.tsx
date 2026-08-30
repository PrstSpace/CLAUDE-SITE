import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export default async function AdminEventsPage() {
  await requireAdminSession();

  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Мероприятия</h1>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Новое мероприятие
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Регистраций</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {event.title}
                  <div className="text-xs font-normal text-neutral-500">/events/{event.slug}</div>
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatEventDate(event.startsAt)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      event.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                        : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                    }
                  >
                    {event.isActive ? "Активно" : "Закрыто"}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{event._count.registrations}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
                    >
                      Управление
                    </Link>
                    <Link
                      href={`/admin/checkin/${event.id}`}
                      className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
                    >
                      Сканер входа
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Пока нет ни одного мероприятия
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
