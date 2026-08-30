import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-neutral-50">
      {session && (
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <nav className="flex items-center gap-4 text-sm font-medium text-neutral-700">
              <Link href="/admin" className="hover:text-neutral-900">
                Мероприятия
              </Link>
            </nav>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <span>{session.email}</span>
              <form action={logoutAction}>
                <button type="submit" className="underline underline-offset-2 hover:text-neutral-900">
                  Выйти
                </button>
              </form>
            </div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
