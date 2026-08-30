import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">PRST Events</h1>
      <p className="max-w-md text-neutral-600">
        Платформа регистрации на мероприятия PRST по QR-коду. Ссылку на
        регистрацию конкретного мероприятия можно найти на табличке рядом
        со стендом.
      </p>
      <Link
        href="/admin"
        className="mt-2 text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
      >
        Вход для организаторов
      </Link>
    </main>
  );
}
